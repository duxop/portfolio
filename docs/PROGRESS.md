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

**Next:** I review `ARCHITECTURE.md` on PR #2 (`docs/planning`), approve it, and merge. Then `UI_DESIGN.md`.

**Open questions:** none new. The open questions in brief §11 now each name the doc that answers them.
