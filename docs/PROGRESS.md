# Progress

## 2026-10-03: Setup decisions

**Built:** nothing yet. Claude rewrote `CLAUDE.md` for the "Claude is the docs, I write the code" method, added `.claude/settings.json` to lock code and config files, and updated the brief.

**Decided:**

- Monorepo laid out like crusher: pnpm workspaces + Turborepo, `packages/config`, `packages/contracts`.
- Current versions, not crusher's: Next 16 and Tailwind 4 (clinicXpert's `apps/site` is the reference for the Tailwind 4 setup).
- `apps/api` (Express, crusher style) from Phase 0, not later.
- TypeScript learned step by step, as each step needs it.

**Versions at time of writing:** Node 22.23, pnpm 11.18, turbo 2.11, next 16.3, tailwindcss 4.3, react 19.3, typescript 7.0. Check which TypeScript version Next 16 supports before installing; 7.0 is the new native compiler.

**Next:** run `git init`, then start Phase 0 step 1.

**Open questions:** where the API is hosted; what the API's first job is (enquiry email, storage, or both).

## 2026-10-03: Switched to an industry project lifecycle

**Built:** nothing yet. `git init` done; step 0 (root `.gitignore`, first commit) in progress. Claude rewrote brief §7 as a lifecycle and updated `CLAUDE.md` to match.

**Decided:**

- The project runs like a product team's: kickoff → requirements (PRD) → design (architecture, ADRs, UI design) → planning (milestones, tickets) → M0 foundation → 3D spike → build milestones M1–M5 → M6 launch readiness → post-launch.
- Claude writes the planning docs (`PRD.md`, `ARCHITECTURE.md`, `UI_DESIGN.md`, ADRs, spike reports) after we plan each one in conversation; I decide, review and approve. (First set as "I write, Claude reviews", changed the same day.) I still write all the code.
- Tickets are GitHub Issues under milestones. One ticket = one branch = one PR; one step = one commit. Merge on GitHub with "Create a merge commit".
- The repo is public.
- In M0 the pipeline comes before features: CI on every PR and Vercel previews come before tokens, fonts and the API.
- The 3D spike moves from the start of the old Phase 4 to right after M0, measured on a real phone.

- Stage 0 done: `.gitignore` and the first commit (`4451e78`), public repo `duxop/portfolio` (the old one is archived as `portfolio-v1`). The crusher figures were held back from the brief before the push, pending the owner's permission.
- PRD approved, with Q2–Q5 as proposed: WhatsApp → form → email; the FR-10 fields; the NFR-3 browsers; launch without the project scenes. So launch is renumbered M5, and the project scenes become M6, after launch.

- Stage 2 drafted: `ARCHITECTURE.md` and ADRs 0001–0007. Hosting is Vercel, Hobby while building and Pro from launch (decided; ask Vercel support before the M0 deploy). Research findings that changed the plan: Vercel Hobby excludes commercial use; typescript-eslint doesn't support TypeScript 7 yet (pin 6.0.3); Resend needs a verified domain, so the domain moves from M5 to M2; Express 5 needs no async wrapper.

- Later the same day, three changes:
  - **Hosting:** Vercel Hobby before and after launch, the owner's call. There is no Pro upgrade and no support email. ADR 0003 was rewritten.
  - **Domain:** buildwithshivam.in is already owned, so it only needs verifying with Resend before M2.
  - **Launch:** launch waits for everything, so the project scenes are back to M5 and launch is M6 (PRD Q5 reversed, A5 withdrawn).
  - Hobby has no custom analytics events, so contact actions are counted from the messages' prefilled text (ADR 0007, PRD FR-9, FR-15).
- PR #1 merged (`d3fb25f`): the settings lock now denies GitHub writes (PR create/merge/close, repo create/edit/rename/archive/delete) and allows read-only `gh`. Tested live both ways. The eight deny lines were given to me on my request, as a one-off exception to the "I write the code" rule.
- ADRs 0004–0007 accepted as recommended: Resend; TypeScript 6.0.3; honeypot plus a Vercel WAF rule; Vercel page views plus counting messages by hand.

- PR #2 merged (`dafb381`): the PRD, the architecture doc, and ADRs 0001–0007. `ARCHITECTURE.md` approved.
- `UI_DESIGN.md` drafted. Decided: a slim sticky header; my photo and bio in Contact; the hero pinned for about one screen of scroll. Both contrast failures are fixed without new tokens: form borders use `stone-400`, and orange buttons have dark text.

- `UI_DESIGN.md` approved, footer included. Stage 2 is done.

- Stage 3 done: milestones M0–M6 created, and M0's nine tickets filed as issues #4–#12.
- ADR 0008: pnpm pinned at 10.34.6, because Vercel supports pnpm 6–10 with zero config and 11+ only through experimental Corepack.

**Next:** M0, ticket #4 (workspace and Turborepo), starting at step 1.

**Open questions:** none new. The open questions in brief §11 now each name the doc that answers them.

## 2026-10-08: Visual design and two themes

**Built:**

- M0 tickets #4–#8 merged: the workspace, shared config, the Next.js app, CI with a `main` ruleset, and the Vercel project `portfolio` (production at portfolio-nine-chi-kvitgiuopr.vercel.app).
- Ticket #9 (tokens and fonts) is paused on `feat/9-tokens-fonts`, waiting for the visual design.

**Decided:**

- **Stage 2b:** a high-fidelity visual design on a Claude design canvas before more UI code: https://claude.ai/artifact/7Apk46w4uQHykactJcTyZA
- **Two themes, each telling one project's story.** Dark is the crusher (basalt and orange). Light is the clinic (white and teal: a chaotic reception becomes an orderly system).
- **Theme rules:** the first visit follows the device setting. A toggle with crusher and clinic icons sits in the header.
- **3D:** one 3D scene per theme, in the hero only. The case studies use still images. The 3D is designed as storyboards before any code.
- **Contrast:** teal and orange both fail as text on white, so the light theme adds `clinic-700` `#0E7C71` for links and focus, and `signal-700` `#B5470F` for errors and crusher accents.

**Approved** the same day: the visual design and the two-theme revision of `UI_DESIGN.md`, with dark background B (warm brown-black: `basalt-950` `#15120F`, `basalt-900` `#1E1A16`, `stone-600` `#5E574F`, `stone-400` `#A39C93`).

**Next session, in order:** Claude updates `CLAUDE.md`'s token table (B's values and the four light tokens), then amends the PRD (hero scenes, a theme-toggle requirement, the case-study stills), ARCHITECTURE (theme set before paint; one scene loaded per theme), adds an ADR on how themes are built, and updates issue #9's criteria. Then #9 resumes.

**Open questions:** the Node and pnpm lines from Vercel's build log (ADR 0008's assumption is still unverified).
