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
- I write the planning docs (`PRD.md`, `ARCHITECTURE.md`, `UI_DESIGN.md`, ADRs, spike reports); Claude reviews them like a design review and never edits them.
- Tickets are GitHub Issues under milestones. One ticket = one branch = one PR; one step = one commit. Merge on GitHub with "Create a merge commit".
- The repo is public.
- In M0 the pipeline comes before features: CI on every PR and Vercel previews come before tokens, fonts and the API.
- The 3D spike moves from the start of the old Phase 4 to right after M0, measured on a real phone.

**Next:** finish step 0, create the public GitHub repo and push `main` (stage 0). Then stage 1: the PRD.

**Open questions:** none new. The open questions in brief §11 now each name the doc that answers them.
