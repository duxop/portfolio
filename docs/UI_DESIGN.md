# UI design

How the page looks and behaves: the principles, the visual system, a low-fi wireframe of every section at 360 px and 1280 px, the hero storyboard, and the states each part must handle. [`PRD.md`](PRD.md) says what the page must do; [`ARCHITECTURE.md`](ARCHITECTURE.md) says how it's built. The token values come from `CLAUDE.md`. Where this file and a newer ADR disagree, the ADR wins.

**Status: Approved**, 2026-10-03. Written by Claude, approved by me, including the footer (U5). Decided on 2026-10-03: a slim sticky header, my photo and bio in Contact, and a hero pinned for about one screen of scroll. Sizes marked _proposal_ get tuned in the browser at M2.

**Revision: Approved**, 2026-10-08. Two themes, each telling one project's Raw → Refined story: dark is the crusher, light is the clinic (§1, §3.1, §3.4, §4.0, §4.3, §5, §6). The hero gets one 3D scene per theme, and the case studies use still images. Decided on 2026-10-08: two themes; the first visit follows the device's setting; two hero scenes only; the 3D is designed as storyboards before any code; dark background B, warm brown-black (U7). Approved the same day.

**Visual design: Approved**, 2026-10-08. A high-fidelity mockup of this document, on a Claude design canvas (private to me): https://claude.ai/artifact/7Apk46w4uQHykactJcTyZA. It has 24 artboards:

- **Dark (crusher):** the page at 1280 and 360 px, and a style board.
- **Light (clinic):** the page at 1280 px, the hero at 360 px, and a style board.
- **Shared:** the theme toggle in both states, the three headline options, both 3D storyboards (three frames each), the form's invalid, sending, sent and failed states, the 404, and three dark-background options.

All copy on it is draft; bracketed values are placeholders. Once approved, it replaces the _proposal_ sizes here, and any token it adds or changes goes into `CLAUDE.md`.

**Revision: Approved**, 2026-10-09. Two storyboard amendments from the scene design ([`3D_DESIGN.md`](3D_DESIGN.md); ADR 0010, ADR 0011): no text inside a scene, so the clinic's wall screen shows a `clinic` block and rows instead of words, and seated patients hold a `clinic` token card instead of a number (§5.2). §5 now points at the scene design. How the two themes are built (the `data-theme` attribute, a semantic token layer over §3.1's tables, the before-paint script) is ADR 0012.

---

## 1. Principles

- **Content first.** Every section is complete as HTML text. Motion and 3D add to a section and never carry meaning on their own (PRD §1, NFR-4).
- **Phone first.** 360 px is the design target and desktop is the enhancement, because most visitors arrive on a phone (PRD A1). This is the opposite of clinicXpert, where desktop is the product.
- **Visible by default.** Content's starting CSS state is its final, visible state. JavaScript sets an element's "from" state only after it has loaded, and only when reduced motion is off. If JavaScript fails or is slow, nothing stays hidden.
- **One accent per theme.** In the dark theme, `signal` orange marks action and focus: buttons, links and the focus ring. In the light theme, `clinic` teal does the same job. Each case study keeps its own project colour for its eyebrow, workflow chips and image accents, in a shade that passes contrast on that theme (§3.1).
- **Every state is designed.** Default, hover, focus-visible and active for every control. Idle, sending, sent, invalid and failed for the form.
- **Two themes, two stories.** Dark is the crusher: "a quarry at dusk" (brief §5), basalt and orange, rocks becoming a dashboard. Light is the clinic: white and teal, a chaotic reception becoming an orderly system. The layout, type and copy are the same in both. Only the colours and the hero scene change. The first visit follows the device's light or dark setting; the toggle in the header overrides it and is remembered. The theme is set before the page paints, so there's no flash of the wrong theme.

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

The dark table resolves both contrast failures from NFR-2, with no new tokens.

**Light theme (clinic)**, proposed 2026-10-08. Contrast was computed with the WCAG relative-luminance formula. Four new tokens: `chalk-50`, `chalk-200`, `clinic-700` and `signal-700`.

| Element                         | Colour                                                          | Contrast                                                        |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| Page background                 | `chalk-50` `#F6F8F7`                                            | —                                                               |
| Raised surface (form, sections) | white `#FFFFFF`                                                 | —                                                               |
| Body text                       | `basalt-900`                                                    | 17.14 on chalk-50                                               |
| Secondary text, labels          | `stone-600`                                                     | 5.93 on chalk-50, 6.33 on white                                 |
| Form field borders              | `stone-600`                                                     | 6.33 on white                                                   |
| Decorative dividers             | `chalk-200` `#D3DAD8`                                           | Exempt: they don't identify a control                           |
| Primary button                  | `clinic` fill, **`basalt-950` text**                            | 7.64. Never white on teal (2.56 fails)                          |
| Secondary button                | `stone-600` border, `basalt-900` text                           | 6.33                                                            |
| Text links, focus ring          | `clinic-700` `#0E7C71`, links always underlined                 | 4.76 on chalk-50, 5.07 on white                                 |
| Errors, crusher accents         | `signal-700` `#B5470F`                                          | 5.08 on chalk-50, 5.42 on white                                 |
| Never                           | `clinic` or `signal` as text on a light background (2.56, 2.87) | They are fills and illustration colours only in the light theme |

**Errors in the dark theme** use `signal` (6.82), with a 2 px border and text, so colour is never the only cue. The design has no red.

**Dark background: B, warm brown-black** (U7, decided 2026-10-08). It changes four token values, with the names kept: `basalt-950` `#15120F`, `basalt-900` `#1E1A16`, `stone-600` `#5E574F`, `stone-400` `#A39C93`. The contrast ratios with these values: body text 14.82; secondary 6.87 (6.37 on surfaces, so field borders still pass); `signal` 6.51; dark text on `signal` 6.51; `clinic` 7.28. In the light theme: body text 16.21, secondary 6.67, field borders 7.11. The ratios in the tables above were computed with the earlier values; every pair still passes with B's. The canvas uses B everywhere except the three comparison boards. `CLAUDE.md`'s token table is updated next session.

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

All three fonts load through `next/font` with the Latin subset. Inter and JetBrains Mono are variable fonts: one file each covers every weight, so no weight is listed for them. Barlow Condensed is not variable, so it loads only 600 and 700, one file per weight. Every font file counts against the 2.5 s budget (checked in `next/font`'s font data, 2026-10-07).

### 3.3 Spacing and shape

- Tailwind's default spacing scale. Sections get 4rem of vertical padding on phones and 6rem from `md` up _(proposal)_.
- **Sticky header:** 3rem (48 px) tall. `scroll-padding-top` is set to the header height, so anchor jumps and focused elements never land under it. That's WCAG technique C43, for SC 2.4.11 _Focus Not Obscured (Minimum)_, level AA ([Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)).
- **Target size:** buttons are at least 44 px tall. Every target is at least 24×24 CSS px, per SC 2.5.8, level AA ([Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). Links inside a sentence are exempt.
- **Corners:** small and consistent, 4 px on buttons, fields and cards. The look is industrial, not soft.

### 3.4 Primitives

These are the pieces each section is built from. Each one is a file in `components/ui/`, one component per file, kebab-case (`CLAUDE.md`).

| Primitive                     | Variants and states                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` (a link or a button) | Primary, secondary. Hover, focus-visible, active. On the form's submit: disabled while sending                                                                                  |
| `TextLink`                    | Inline, or standalone with an ↗ for an external link (with "opens in a new tab" text for screen readers)                                                                        |
| `SectionHeading`              | Eyebrow plus h2, with an id for the section's `aria-labelledby`                                                                                                                 |
| `Stat`                        | Number (mono) plus label. Count-up from M3                                                                                                                                      |
| `Field`                       | Label, input or textarea, hint, error. Invalid state: `aria-invalid`, error text linked with `aria-describedby`                                                                 |
| `Disclosure`                  | A native `<details>`/`<summary>`, for "Under the hood"                                                                                                                          |
| `ThemeToggle`                 | Two icon buttons in a group: a crusher (dark) and a clinic cross (light). The current one is filled and `aria-pressed="true"`. Each has an `aria-label` ("Crusher theme, dark") |

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
│ Shivam Sangwan [◪|✚][Get in…]│        │ Shivam Sangwan                       [◪|✚] [Get in touch]│
└──────────────────────────────┘        └──────────────────────────────────────────────────────────┘
  sticky, 48 px, the page colour at 90% opacity, a divider hairline below; [◪|✚] is the theme toggle
```

- **Skip link:** "Skip to content" is the first focusable element. It's visually hidden until focused, then appears above the header (FR-2).
- **Header:** my name (a link to the top), the theme toggle (§3.4), and "Get in touch", a secondary button that jumps to `#contact`. No other navigation: it's one page.
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

- **The image slot holds a still image, not 3D** (decided 2026-10-08): a frame of the matching hero scene. Both stills show in both themes, so a visitor in either theme sees both projects.
- **Crusher (FR-6):** the eyebrow and chips use `signal` in the dark theme and `signal-700` in the light theme.
- **ClinicXpert (FR-7):** the same layout, with `clinic` for the eyebrow (`clinic-700` in the light theme), the chips and the image accents, and a "See it live ↗" link to https://app.clinicxpert.in/ under the outcome line. Buttons always use the current theme's accent.
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

## 5. Hero storyboards

The hero holds still while the visitor scrolls one screen height. Over that distance, scroll progress runs from 0 to 1 and drives the scene. The movement is scrubbed, so scrolling back reverses it. The text never moves or changes: it's real HTML beside the canvas (or above it on a phone).

There is one scene per theme (decided 2026-10-08). Only the current theme's scene loads. Switching themes swaps the static image at once, and loads the other scene only if the visitor stays on it. Both scenes share the same rules (below), the same timing, and the same look: low-poly, flat-shaded, few colours. The scene design, with each cast member's count, size, position and keyframes, is [`3D_DESIGN.md`](3D_DESIGN.md).

### 5.1 Dark: the crusher

**Cast.**

- Rocks: icosahedrons of a few sizes in `stone-600` and `stone-400`.
- Spreadsheet-cell planes (outlined).
- Paper-challan planes (`stone-100`, with ruled lines).
- A low-poly crusher at the centre: a hopper with a `signal` edge over a jaw box.
- A conveyor.
- The dashboard parts: boxes that become a table, bars and a stat card. One bar is `signal`.

**Light and camera.**

- One warm key light from the upper left ("dusk"), plus a low cool fill.
- No shadows beyond flat shading.
- A fixed three-quarter camera with a slight push-in over the scroll.

| Progress         | The scene shows                                                                                           | On screen                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Load (no scroll) | **Raw.** Rocks, cells and challans scattered and drifting slowly around the idle crusher                  | Eyebrow, headline, sub and button. All visible from the first paint, never animated in |
| 0 → 0.35         | The drift stops, and the pieces start moving toward the crusher's mouth                                   | Unchanged                                                                              |
| 0.35 → 0.65      | **Through.** The pieces pass through the crusher, and uniform boxes come out the bottom onto the conveyor | Unchanged                                                                              |
| 0.65 → 0.90      | **Refined.** The boxes snap into rows and columns: a table, a bar chart and a stat card                   | Unchanged                                                                              |
| 0.90 → 1         | The dashboard settles. The pin releases                                                                   | The proof strip scrolls in                                                             |

**Static image** alt text: "Scattered rocks and spreadsheet cells pass through a crusher and come out as an ordered dashboard."

### 5.2 Light: the clinic

**Cast.**

- A reception desk with a `clinic` edge.
- Low-poly people: a sphere head and a tapered body. Staff are `clinic`; patients are `stone-400` and `stone-600`.
- Paper sheets and files (white, with teal rules).
- A row of waiting chairs.
- A wall screen (`basalt-900`) that becomes a queue display: a `clinic` block where "Now serving" would be, and the queue as rows. No text inside the scene; the meaning is in the alt text (amended 2026-10-09).

**Light and camera.**

- Bright, even light from above (a clinic's ceiling light), and a soft fill.
- The same camera as the crusher scene, so the two read as a pair.

| Progress         | The scene shows                                                                                                                                                | On screen |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Load (no scroll) | **Chaos.** Papers flutter in the air, people hurry with files at odd angles, chairs sit out of line, and the wall screen is blank                              | As 5.1    |
| 0 → 0.35         | The papers slow and turn toward the wall screen; the people slow down                                                                                          | Unchanged |
| 0.35 → 0.65      | **Gathering.** The papers stream into the screen and become its rows; the people turn toward the desk                                                          | Unchanged |
| 0.65 → 0.90      | **Ordered.** The chairs line up and the patients sit, each holding a `clinic` token card; the desk keeps one tidy stack; the screen's `clinic` block lights up | Unchanged |
| 0.90 → 1         | The room settles. The pin releases                                                                                                                             | As 5.1    |

**Static image** alt text: "A busy clinic reception, papers flying and people rushing, turns into an orderly waiting room with a queue screen."

### 5.3 Rules for both scenes

**The static image.**

- **When it shows:** with reduced motion on, without WebGL, while the scene loads, if the scene fails, and in M2–M3 before the scenes exist.
- **What it is:** one composed frame per theme that tells the whole story from left to right, chaos to order. That way the meaning survives without motion.
- **Who makes it:** in M2, a simple SVG composition, as on the canvas. From M4 onward, a render of the real scene.

**Other rules:**

- The canvas is `aria-hidden`; its meaning is in the image's alt text and the headline.
- If the visitor never scrolls, only the slow idle motion plays (drift, or fluttering papers), and it pauses when the tab is hidden.
- Pixel ratio is capped (NFR-1). Only one scene is ever in memory.
- The pin uses the small-viewport height unit, so a phone's collapsing address bar doesn't make it jump. Checked at M4.
- The 3D spike (stage 5) builds the crusher scene first. Its frame-rate result applies to both scenes, since they share a camera, a light count and the size of the cast.

## 6. Accessibility checklist

This applies the PRD's WCAG 2.2 AA requirement (NFR-2) to this design. The M6 accessibility pass checks every line.

- One `h1` (the hero headline). An `h2` for each section. `h3` for blocks within a section. No skipped levels.
- Landmarks: `header`, `main` and `footer`. Each section is a `<section>` labelled by its `h2` (`aria-labelledby`).
- The skip link goes first. Focus is visible on everything (§3.1). `scroll-padding-top` clears the sticky header (§3.3).
- Targets are at least 24×24 px, and buttons at least 44 px tall (§3.3).
- Contrast pairs only from §3.1.
- Images: real content gets descriptive alt text. Decorative images get `alt=""`. Every canvas is `aria-hidden`, with its meaning in text.
- The form follows §4.5's states.
- The theme toggle is a group of two real buttons with `aria-pressed` and `aria-label`, reachable by keyboard, and both themes pass §3.1's contrast table.
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
| U7  | Dark background: A, B or C (§3.1)                             | Decided 2026-10-08: B   |
