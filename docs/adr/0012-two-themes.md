---
id: 0012
title: Two themes through a data attribute, a semantic token layer and an inline script
status: accepted
date: 2026-10-09
needed-by: M0
reversibility: costly
decided-by: shivam
---

## Context

`UI_DESIGN.md` §1 (revised 2026-10-08) gives the site two themes, each with its own palette (§3.1): the first visit follows the device's setting, the header toggle overrides it and is remembered, and the theme is set before the page paints so there is no flash of the wrong one. PRD FR-2 carries the same requirement, and `ARCHITECTURE.md` §3 puts the theme in load stage 1, before any JavaScript bundle. Tailwind 4 is CSS-first (`@theme` in `globals.css`, ticket #9), and the 3D hero loads one scene per theme (`3D_DESIGN.md` §2.4), so whatever marks the theme must be readable by CSS and by a client component. Three coupled questions, decided together on 2026-10-09.

Facts checked on 2026-10-09:

- Tailwind's [dark mode page](https://tailwindcss.com/docs/dark-mode) (v4.3) shows a data-attribute variant, `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`, and says the theme script is "best to add inline in `head` to avoid FOUC".
- Tailwind's [theme page](https://tailwindcss.com/docs/theme) says theme variables must be top-level, never nested under a selector, and that `@theme inline` makes a utility use the value of a variable it references, which is how a per-selector variable can back a utility.
- React's [`<script>` reference](https://react.dev/reference/react-dom/components/script) renders an inline script with string children in place. Its [`hydrateRoot` page](https://react.dev/reference/react-dom/client/hydrateRoot) says `suppressHydrationWarning` silences one element's unavoidable mismatch and "only works one level deep".
- Next's [scripts guide](https://nextjs.org/docs/app/guides/scripts) (16.4.0): `next/script` strategies are for third-party scripts, and an inline one needs an `id`.
- The reference: `../clinicXpert/packages/ui/src/theme-script.ts` and its use at `../clinicXpert/apps/site/src/app/layout.tsx:30`.
- `next-themes` 0.4.6 on npm, 34 kB unpacked, no dependencies.

## Options

### Question 1: how the page is marked

**Option 1a: `data-theme` on `<html>`, with `color-scheme`.** The attribute holds `dark` or `light`. Each theme's rule also sets `color-scheme`, so scrollbars and native form controls match.

- **Pros:** matches the reference and the Tailwind docs' own data-attribute example. Readable by CSS, by a client component, and by a test.
- **Cons:** none found.
- **Cost to reverse:** easy, a find-and-replace in CSS and the script.

**Option 1b: a `.dark` class on `<html>`.** Tailwind's first example.

- **Pros:** the same reach.
- **Cons:** a class on the root is easier to collide with, and "no class" has to mean light, which reads worse than two explicit values.
- **Cost to reverse:** easy.

### Question 2: how the CSS switches

**Option 2a: a semantic layer over the palette.** The eleven palette tokens live in `@theme`, so `bg-basalt-950` and friends exist. On top of them, about a dozen role variables (background, surface, text, muted text, control border, divider, accent, text on accent, link, focus, error, the other project's accent) are set as plain CSS variables under `[data-theme=dark]` and `[data-theme=light]`, and exposed as utilities through `@theme inline`. Components use role utilities; only the 3D scenes and the "other project" accents use palette tokens directly.

- **Pros:** UI_DESIGN §3.1's two tables become CSS exactly once. A component says one class, not a light-and-dark pair, so there is nothing to forget. Contrast is proved per role in the design doc, and the audit can check "no palette colour in a component".
- **Cons:** a second vocabulary to learn, and a role that fits one theme but not the other has to be split.
- **Cost to reverse:** costly once components use the role names everywhere.

**Option 2b: the `dark:` variant on every element.** `@custom-variant dark` as above, and each element carries both colours.

- **Pros:** one vocabulary, the palette. No indirection.
- **Cons:** every colour appears twice in every component, and a missed pair is a bug that only shows in one theme. The design's role tables exist only in the reviewer's head.
- **Cost to reverse:** costly, for the same reason.

### Question 3: the before-paint script

**Option 3a: an inline `<script>` in the root layout's `<head>`.** About five lines, no `'use client'`, as the reference does: read the saved choice; if there is none, read `prefers-color-scheme`; set the attribute; wrapped in `try` so a blocked storage can't throw. `<html>` gets `suppressHydrationWarning`, because the attribute is set before React hydrates.

- **Pros:** runs before anything else, costs nothing, and is the pattern both Tailwind and the reference use. Dependency-free.
- **Cons:** a string of JavaScript inside a TSX file, which the linter and the type checker don't see. The mismatch warning has to be suppressed on one element.
- **Cost to reverse:** easy.

**Option 3b: `next/script` with `beforeInteractive`.**

- **Pros:** the Next way for scripts that must run early.
- **Cons:** built for third-party scripts; an inline one needs an `id`; it adds nothing to five lines.
- **Cost to reverse:** easy.

**Option 3c: the `next-themes` package.** It does the attribute, the script, the stored choice and the toggle state.

- **Pros:** well used, no dependencies of its own, and it would also give the toggle its state.
- **Cons:** a dependency for about twenty lines of our own, which the brief's "no dependency without a reason" rule asks us to justify. It also owns a piece of the page that the course wants written by hand.
- **Cost to reverse:** easy.

## Recommendation

1a, 2a and 3a. Together they are the reference's pattern plus a semantic layer. The trade-off accepted is 2a's indirection: a role vocabulary to learn, in exchange for a component that is right in both themes by construction. 3c is better at being finished today; it was passed over because the whole feature is twenty lines, and writing them is the point of the course.

## Decision

1a, 2a and 3a, as recommended (2026-10-09). The work lands as a new M0 ticket after #9, with the toggle button itself in M2's header ticket.

## Consequences

- `globals.css` holds three things: the palette in `@theme`, the role variables under each `[data-theme]` selector (with `color-scheme`), and an `@theme inline` block that maps roles to utilities. The role names are chosen at the ticket; the roles are:

| Role                       | Dark (crusher) | Light (clinic) |
| -------------------------- | -------------- | -------------- |
| Page background            | `basalt-950`   | `chalk-50`     |
| Raised surface             | `basalt-900`   | white          |
| Body text                  | `stone-100`    | `basalt-900`   |
| Secondary text             | `stone-400`    | `stone-600`    |
| Control border             | `stone-400`    | `stone-600`    |
| Decorative divider         | `stone-600`    | `chalk-200`    |
| Accent (button fill)       | `signal`       | `clinic`       |
| Text on the accent         | `basalt-950`   | `basalt-950`   |
| Link, focus ring           | `signal`       | `clinic-700`   |
| Error                      | `signal`       | `signal-700`   |
| The other project's accent | `clinic`       | `signal-700`   |

- The root layout's `<head>` carries the inline script, and `<html>` carries `suppressHydrationWarning`. Nothing else in the tree is suppressed.
- The toggle (M2) sets the attribute and the stored choice. The hero scene and the toggle read the current theme through one client-side provider, decided at the M2 header ticket.
- There is no "follow the system" state in the toggle (UI_DESIGN §3.4). The device setting is read only when nothing is stored, so a visitor who changes their OS setting after choosing keeps their choice.
- The audit gains a check: a component uses role utilities, never a palette token, except the 3D scenes and the two "other project" accents.
- The brief's stack table gains nothing; `next-themes` is not installed.

## Revisit when

A third theme is wanted, the toggle needs a "system" state, or Tailwind ships a first-class way to scope theme variables per selector that makes the `@theme inline` layer redundant.
