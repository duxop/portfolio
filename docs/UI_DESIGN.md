# UI design

How the page looks and behaves: the principles, the visual system, a low-fi wireframe of every section at 360 px and 1280 px, the hero storyboard, and the states each part must handle. [`PRD.md`](PRD.md) says what the page must do; [`ARCHITECTURE.md`](ARCHITECTURE.md) says how it's built. The token values come from `CLAUDE.md`. Where this file and a newer ADR disagree, the ADR wins.

**Status: Approved**, 2026-10-03. Written by Claude, approved by me, including the footer (U5). Decided on 2026-10-03: a slim sticky header, my photo and bio in Contact, and a hero pinned for about one screen of scroll. Sizes marked _proposal_ get tuned in the browser at M2.

---

## 1. Principles

- **Content first.** Every section is complete as HTML text. Motion and 3D add to a section and never carry meaning on their own (PRD §1, NFR-4).
- **Phone first.** 360 px is the design target and desktop is the enhancement, because most visitors arrive on a phone (PRD A1). This is the opposite of clinicXpert, where desktop is the product.
- **Visible by default.** Content's starting CSS state is its final, visible state. JavaScript sets an element's "from" state only after it has loaded, and only when reduced motion is off. If JavaScript fails or is slow, nothing stays hidden.
- **One accent.** `signal` marks action and focus: buttons, links and the focus ring. `clinic` teal appears only in the ClinicXpert section.
- **Every state is designed.** Default, hover, focus-visible and active for every control. Idle, sending, sent, invalid and failed for the form.
- **Dark only.** The site has one theme, "a quarry at dusk" (brief §5). There's no light theme and no toggle.

## 2. Responsive target

Tailwind 4's default breakpoints ([Responsive design](https://tailwindcss.com/docs/responsive-design), v4.3): `sm` 40rem (640 px), `md` 48rem (768 px), `lg` 64rem (1024 px), `xl` 80rem (1280 px). No custom breakpoints.

| Width       | Layout                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| < 768 px    | One column. 16 px side gutters. Phone layouts below                              |
| 768–1023 px | One column with a wider measure. 32 px gutters. The proof strip goes four across |
| ≥ 1024 px   | Two-column hero, case studies and contact. Desktop layouts below                 |

Every change is checked at **360, 768 and 1280 px** (`CLAUDE.md`). Content stops widening at 72rem (1152 px) and is centred.

## 3. Visual system

### 3.1 Colour in use

The token values are in `CLAUDE.md`. The pairings come from the contrast check in PRD NFR-2.

| Element                                       | Colour                                    | Contrast                                                     |
| --------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Page background                               | `basalt-950`                              | —                                                            |
| Raised surface (form panel, case-study cards) | `basalt-900`                              | —                                                            |
| Body text                                     | `stone-100`                               | 15.54 on 950                                                 |
| Secondary text, labels, captions              | `stone-400`                               | 7.42 on 950, 6.93 on 900                                     |
| **Form field borders**                        | `stone-400`                               | 6.93 on 900. **Not `stone-600`**: at 2.89 it fails SC 1.4.11 |
| Decorative dividers (`<hr>`, section rules)   | `stone-600`                               | Exempt from 1.4.11, since they don't identify a control      |
| Primary button                                | `signal` fill, **`basalt-950` text**      | 6.82. Never `stone-100` on `signal` (2.28 fails)             |
| Secondary button                              | `stone-400` 1 px border, `stone-100` text | Border 7.42 on 950                                           |
| Text links                                    | `signal`, **always underlined**           | 6.82 on 950. The underline means colour isn't the only cue   |
| Focus ring                                    | 2 px `signal` outline, 2 px offset        | 6.82 on 950, 6.37 on 900                                     |
| ClinicXpert accents                           | `clinic`                                  | 7.64 on 950. Dark text on a teal fill (7.64)                 |

The table resolves both contrast failures from NFR-2, and the design needs no new tokens.

### 3.2 Type

| Use                                   | Font             | Weight                    | Size, phone → ≥ 768 px _(proposal)_                 |
| ------------------------------------- | ---------------- | ------------------------- | --------------------------------------------------- |
| Hero headline (h1, the LCP element)   | Barlow Condensed | 700                       | 2.75rem → 4.5rem, line-height 1.05                  |
| Section heading (h2)                  | Barlow Condensed | 600                       | 2.25rem → 3rem                                      |
| Block heading (h3)                    | Barlow Condensed | 600                       | 1.5rem → 1.75rem                                    |
| Eyebrow above an h2 ("Case study 01") | JetBrains Mono   | 500                       | 0.8125rem, uppercase, letter-spacing 0.08em         |
| Body                                  | Inter            | 400, and 600 for emphasis | 1rem → 1.125rem, line-height 1.6, max 65ch per line |
| Small print (captions, form hints)    | Inter            | 400                       | 0.875rem                                            |
| Proof numbers, data, durations        | JetBrains Mono   | 500                       | 2.5rem → 3.5rem, tabular figures                    |

All three fonts load through `next/font` with the Latin subset, and only the weights listed. Each weight is another file in the 2.5 s budget.

### 3.3 Spacing and shape

- Tailwind's default spacing scale. Sections get 4rem of vertical padding on phones and 6rem from `md` up _(proposal)_.
- **Sticky header:** 3rem (48 px) tall. `scroll-padding-top` is set to the header height, so anchor jumps and focused elements never land under it. That's WCAG technique C43, for SC 2.4.11 _Focus Not Obscured (Minimum)_, level AA ([Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)).
- **Target size:** buttons are at least 44 px tall. Every target is at least 24×24 CSS px, per SC 2.5.8, level AA ([Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). Links inside a sentence are exempt.
- **Corners:** small and consistent, 4 px on buttons, fields and cards. The look is industrial, not soft.

### 3.4 Primitives

These are the pieces each section is built from. Each one is a file in `components/ui/`, one component per file, kebab-case (`CLAUDE.md`).

| Primitive                     | Variants and states                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Button` (a link or a button) | Primary, secondary. Hover, focus-visible, active. On the form's submit: disabled while sending                  |
| `TextLink`                    | Inline, or standalone with an ↗ for an external link (with "opens in a new tab" text for screen readers)        |
| `SectionHeading`              | Eyebrow plus h2, with an id for the section's `aria-labelledby`                                                 |
| `Stat`                        | Number (mono) plus label. Count-up from M3                                                                      |
| `Field`                       | Label, input or textarea, hint, error. Invalid state: `aria-invalid`, error text linked with `aria-describedby` |
| `Disclosure`                  | A native `<details>`/`<summary>`, for "Under the hood"                                                          |

### 3.5 Motion rules

- One idea per section (brief §5). Nothing moves without a reason.
- UI transitions (hover, focus, form states) take 150–200 ms. Scroll-linked motion is scrubbed, so it follows the scroll position, and reverses when you scroll back.
- **Reduced motion** means the final state is shown at once:
  - Lenis is turned off, so scrolling is native;
  - no pins and no count-ups;
  - each 3D scene is replaced by its static image.
- **Pinning on a case study is CSS `position: sticky`,** not a JavaScript pin. It's native, it needs no JavaScript, and reduced motion doesn't affect it. The hero is the only JavaScript pin (§5).
- Ambient motion, such as the hero's idle drift, pauses when the tab is hidden or the scene is off screen.

## 4. The page, section by section

These are low-fidelity wireframes: they fix order, grouping and hierarchy, not exact sizes.

### 4.0 Header and footer

```
360 px                                  1280 px
┌──────────────────────────────┐        ┌──────────────────────────────────────────────────────────┐
│ Shivam Sangwan [Get in touch]│        │ Shivam Sangwan                              [Get in touch]│
└──────────────────────────────┘        └──────────────────────────────────────────────────────────┘
  sticky, 48 px, basalt-950 at 90% opacity, a stone-600 hairline below
```

- **Skip link:** "Skip to content" is the first focusable element. It's visually hidden until focused, then appears above the header (FR-2).
- **Header:** my name, which is a link to the top, and "Get in touch", a secondary button that jumps to `#contact`. No other navigation: it's one page.
- **Footer:** one line:
  - © year and my name;
  - the email link;
  - "Built by hand. Source on GitHub ↗", linking to the public repo for developers (PRD §3).

### 4.1 Hero

```
360 px                                  1280 px
┌──────────────────────────────┐        ┌──────────────────────────────────────────────────────────┐
│ RAW → REFINED          eyebrow│        │ RAW → REFINED             ┌──────────────────────────────┐│
│                              │        │                           │                              ││
│ Headline over two or         │        │ Headline over two         │        3D scene              ││
│ three lines           (h1)   │        │ or three lines     (h1)   │     (static image until      ││
│                              │        │                           │      it loads, §5)           ││
│ One-line sub                 │        │ One-line sub              │                              ││
│                              │        │                           │                              ││
│ [ Get in touch ]   primary   │        │ [ Get in touch ]          │                              ││
│ ┌──────────────────────────┐ │        │                           └──────────────────────────────┘│
│ │   3D scene / image, 4:3  │ │        │   text: 5 of 12 columns        scene: 7 of 12 columns      │
│ └──────────────────────────┘ │        └──────────────────────────────────────────────────────────┘
└──────────────────────────────┘          fills the viewport below the header; pinned for one screen (§5)
```

- The text comes before the scene in the HTML and on a phone, so the headline paints first (NFR-1).
- "Get in touch" jumps to `#contact`, where WhatsApp leads (FR-9).
- The scene area has a fixed aspect ratio, so the image-to-canvas swap shifts nothing (CLS).

### 4.2 Proof strip

```
360 px                                  1280 px
┌──────────────┬──────────────┐         ┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 00           │ 00           │         │ 00          │ 00          │ 00          │ 00          │
│ label        │ label        │         │ label       │ label       │ label       │ label       │
├──────────────┼──────────────┤         └─────────────┴─────────────┴─────────────┴─────────────┘
│ 00           │ 00           │           four across from 768 px; stone-600 dividers
│ label        │ label        │
└──────────────┴──────────────┘
```

- Each item is a `Stat`. The number is in the HTML at its final value, and the count-up (M3) animates _to_ it.
- The numbers are open (PRD Q1). The layout holds four, and the labels stay short, at most four words.
- The strip is a list (`<ul>`), so screen readers announce "list, 4 items".

### 4.3 Case study (one layout, used twice)

```
360 px                                  1280 px
┌──────────────────────────────┐        ┌──────────────────────────────────────────────────────────┐
│ CASE STUDY 01         eyebrow│        │ CASE STUDY 01                                            │
│ Crusher billing & ERP   (h2) │        │ Crusher billing & ERP (h2)                               │
│ One-line outcome             │        │ One-line outcome                                         │
│                              │        │ ┌────────────────────────┐ ┌───────────────────────────┐ │
│ The problem             (h3) │        │ │ The problem       (h3) │ │                           │ │
│ text                         │        │ │ text                   │ │   scene / static image    │ │
│ What I observed         (h3) │        │ │ What I observed   (h3) │ │   (sticky: stays in view  │ │
│ text + workflow map          │        │ │ text + workflow map    │ │    while the left column  │ │
│ What I built            (h3) │        │ │ What I built      (h3) │ │    scrolls)               │ │
│ text                         │        │ │ text                   │ │                           │ │
│ ┌──────────────────────────┐ │        │ │ Result            (h3) │ └───────────────────────────┘ │
│ │ scene / static image     │ │        │ │ text + how measured    │                               │
│ └──────────────────────────┘ │        │ └────────────────────────┘                               │
│ Result                  (h3) │        │ ┌────────────────────────┐ ┌───────────────────────────┐ │
│ text + how it was measured   │        │ │ BEFORE                 │ │ AFTER                     │ │
│ ┌──────────────────────────┐ │        │ │ old Excel sheet        │ │ dashboard, dummy data     │ │
│ │ BEFORE: old Excel sheet  │ │        │ └────────────────────────┘ └───────────────────────────┘ │
│ └──────────────────────────┘ │        │ ▸ Under the hood (details, collapsed)                    │
│ ┌──────────────────────────┐ │        └──────────────────────────────────────────────────────────┘
│ │ AFTER: dashboard, dummy  │ │
│ └──────────────────────────┘ │
│ ▸ Under the hood   (details) │
└──────────────────────────────┘
```

- **Crusher (FR-6):** the plant scene (M5) fills the scene slot. Until M5, a still image fills it.
- **ClinicXpert (FR-7):** the same layout, with `clinic` teal replacing `signal` for the eyebrow, the rules and the scene accents, and a "See it live ↗" link to https://app.clinicxpert.in/ under the outcome line. Its buttons stay `signal`: action is always orange.
- **Before and after** are real `<img>` elements with descriptive alt text, captioned "Before" and "After" in text, never in colour alone. Screenshots and recordings use dummy data only (NFR-6).
- **"Under the hood"** is a native `<details>`: collapsed for owners, one click for developers, keyboard accessible with no JavaScript.

### 4.4 How I work

```
360 px                                  1280 px
┌──────────────────────────────┐        ┌──────────────────────────────────────────────────────────┐
│ HOW I WORK                   │        │ HOW I WORK                                               │
│ (h2)                         │        │ (h2)                                                     │
│ ●─ 01 Observe           (h3) │        │  ●──────────────●──────────────●──────────────●          │
│ │  what happens              │        │  01 Observe     02 Map         03 Build       04 Hand over│
│ │  you give · you get        │        │  what happens   what happens   what happens   what happens│
│ │  ~ duration          (mono)│        │  give · get     give · get     give · get     give · get  │
│ ●─ 02 Map                    │        │  ~ duration     ~ duration     ~ duration     ~ duration  │
│ │  …                         │        └──────────────────────────────────────────────────────────┘
│ ●─ 03 Build                  │          the connecting line draws left to right on enter (M3)
│ │  …                         │
│ ●─ 04 Hand over              │
│    …                         │
└──────────────────────────────┘
```

- An ordered list (`<ol>`), so the sequence is in the markup, not only in the drawing.
- The connecting line is an SVG stroke that draws on entering the viewport (M3). With reduced motion, it's drawn from the start.
- The durations are open (PRD Q6). There are no prices (PRD §5).

### 4.5 Contact

```
360 px                                  1280 px
┌──────────────────────────────┐        ┌──────────────────────────────────────────────────────────┐
│ Tell me how your business    │        │ Tell me how your business runs today. (h2)               │
│ runs today.             (h2) │        │ ┌──────────────────────────┐ ┌─────────────────────────┐ │
│ ┌──────┐ Shivam Sangwan      │        │ │ ┌──────┐ Shivam Sangwan  │ │ Send a message     (h3) │ │
│ │photo │ 2–3 lines of bio:   │        │ │ │photo │ 2–3 lines bio   │ │ Name                    │ │
│ └──────┘ you'll talk to me   │        │ │ └──────┘                 │ │ [                     ] │ │
│                              │        │ │                          │ │ Phone or WhatsApp       │ │
│ [ Chat on WhatsApp ] primary │        │ │ [ Chat on WhatsApp ]     │ │ [                     ] │ │
│                              │        │ │                          │ │ Email                   │ │
│ or send a message       (h3) │        │ │ or email hello@…  link   │ │ [                     ] │ │
│ ┌──────────────────────────┐ │        │ └──────────────────────────┘ │ How does your business  │ │
│ │ Name, Phone, Email,      │ │        │                              │ run today?              │ │
│ │ How does your business   │ │        │                              │ [                     ] │ │
│ │ run today?, Business     │ │        │                              │ Business (optional)     │ │
│ │ [ Send message ]         │ │        │                              │ [ Send message ]        │ │
│ │ note: goes to my inbox,  │ │        │                              │ note: inbox, not stored │ │
│ │ not stored               │ │        │                              └─────────────────────────┘ │
│ └──────────────────────────┘ │        └──────────────────────────────────────────────────────────┘
│ or email hello@…   (link)    │
└──────────────────────────────┘
```

- **Order** (PRD Q2): WhatsApp, then the form, then email. On a phone that's top to bottom; on desktop, WhatsApp and email sit beside the photo and the form takes the right column.
- **The photo** is a real `<img>` with my name as its alt text. Under the decided placement, this is the only photo on the page.
- **The WhatsApp button** opens `wa.me` with a prefilled first message that names the site. The email link has a prefilled subject that names the site. Both are how contact actions get counted (ADR 0007).

#### Form states (FR-10)

| State   | What the visitor sees                                                                                                      | For assistive tech                                            |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Idle    | The fields, each label visible. "(required)" written in the label, not shown only as an asterisk                           | Native `required`                                             |
| Sending | The button reads "Sending…" and is disabled; the fields stay editable                                                      | `aria-busy` on the form                                       |
| Invalid | An error under each problem field, in text. Focus moves to the first invalid field. Everything typed stays                 | `aria-invalid`, plus `aria-describedby` pointing at the error |
| Sent    | The form is replaced by a panel: "Thanks, [name]. I'll reply within [time]."                                               | Focus moves to the panel's heading                            |
| Failed  | A panel above the form: "That didn't send. WhatsApp or email me instead," with both links. The form keeps everything typed | Announced through a polite live region                        |

The honeypot field (ADR 0006) is hidden from sight and from screen readers, and skipped by keyboard focus.

## 5. Hero storyboard

The hero holds still while the visitor scrolls one screen height. Over that distance, scroll progress runs from 0 to 1 and drives the scene. The movement is scrubbed, so scrolling back reverses it. The text never moves or changes: it's real HTML beside the canvas (or above it on a phone).

| Progress         | The scene shows                                                                                                                                                                                                                       | On screen                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Load (no scroll) | **Raw.** Flat-shaded rocks (icosahedrons in `stone-600` and `stone-400`), spreadsheet-cell planes and paper-challan planes, scattered and drifting slowly. A low-poly crusher in `basalt-900` with a `signal` edge sits at the centre | Eyebrow, headline, sub and button. All visible from the first paint, never animated in |
| 0 → 0.35         | The drift stops, and the pieces start moving toward the crusher's mouth                                                                                                                                                               | Unchanged                                                                              |
| 0.35 → 0.65      | **Through.** The pieces pass through the crusher, and uniform boxes come out the bottom, like graded material on a conveyor                                                                                                           | Unchanged                                                                              |
| 0.65 → 0.90      | **Refined.** The boxes snap into rows and columns: a table, two bar charts and a stat card. One bar is `signal`                                                                                                                       | Unchanged                                                                              |
| 0.90 → 1         | The dashboard settles. The pin releases                                                                                                                                                                                               | The proof strip scrolls in, and its numbers echo the dashboard's stat card             |

**The static image.** It's used with reduced motion on, without WebGL, while the scene loads, if the scene fails, and in M2–M3 before the scene exists. It's one composed frame that tells the whole story left to right: raw pieces, the crusher, the refined dashboard. That way the meaning survives without motion.

- **Alt text:** "Scattered rocks and spreadsheet cells pass through a crusher and come out as an ordered dashboard."
- **Who makes it:** in M2 it's a simple SVG composition, and from M4 a render of the real scene.

**Other rules:**

- The canvas is `aria-hidden`; its meaning is in the image's alt text and the headline.
- If the visitor never scrolls, only the slow drift plays, and it pauses when the tab is hidden.
- Pixel ratio is capped (NFR-1).
- The pin uses the small-viewport height unit, so a phone's collapsing address bar doesn't make it jump. Checked at M4.

## 6. Accessibility checklist

This applies the PRD's WCAG 2.2 AA requirement (NFR-2) to this design. The M6 accessibility pass checks every line.

- One `h1` (the hero headline). An `h2` for each section. `h3` for blocks within a section. No skipped levels.
- Landmarks: `header`, `main` and `footer`. Each section is a `<section>` labelled by its `h2` (`aria-labelledby`).
- The skip link goes first. Focus is visible on everything (§3.1). `scroll-padding-top` clears the sticky header (§3.3).
- Targets are at least 24×24 px, and buttons at least 44 px tall (§3.3).
- Contrast pairs only from §3.1.
- Images: real content gets descriptive alt text. Decorative images get `alt=""`. Every canvas is `aria-hidden`, with its meaning in text.
- The form follows §4.5's states.
- Reduced motion follows §3.5's list.
- External links say they open a new tab.

## 7. Content model, for M1

M1 writes this content as typed data in `apps/web/src/content/`. The fields each section needs:

| Section          | Fields                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero             | eyebrow, headline, sub, CTA label, static image and its alt text                                                                                                                    |
| Proof strip      | four × (value, label)                                                                                                                                                               |
| Case study (× 2) | eyebrow, title, outcome, problem, observed (plus a workflow map), built, result, how measured, before image and alt, after image and alt, under-the-hood points, optional live link |
| How I work       | four × (name, what happens, client gives, client gets, typical duration)                                                                                                            |
| Contact          | heading, photo and alt, bio, WhatsApp number and prefilled message, email and prefilled subject, form labels and hints, sent and failed messages                                    |
| Footer           | repo link text                                                                                                                                                                      |

## 8. Open questions

| #   | Question                                                      | Needed by               |
| --- | ------------------------------------------------------------- | ----------------------- |
| U1  | Which headline (PRD Q10)                                      | M1                      |
| U2  | The four proof numbers (PRD Q1)                               | M1                      |
| U3  | The step durations for How I work (PRD Q6)                    | M1                      |
| U4  | The reply time promised in the form's sent message            | M1                      |
| U5  | The footer as proposed in §4.0?                               | Decided 2026-10-03: yes |
| U6  | Type scale and spacing marked _proposal_: tune in the browser | M2                      |
