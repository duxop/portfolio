# Portfolio: Project Brief

Kickoff brief for the portfolio site: the concept, the content, the facts, and the lifecycle (§7). Claude keeps it current. It is the starting material for `docs/PRD.md` and `docs/ARCHITECTURE.md`. Once those are approved, they are the source of truth for requirements and design, and this brief remains the kickoff record and the plan.

## 1. Positioning

**One line:** I turn messy real-world operations into software that runs the business.

**What makes me different:** I don't start from a feature list. I sit with how a business actually works, map the system, and then build software around it. The crusher project is the proof: they ran on Excel, and now billing, records and analytics live in one tool.

**Audience (assumption, change if wrong):** owners of small and mid-sized businesses like my two clients, plus people who refer work to me. Copy should be plain and outcome-first, not technical. Tech details go in a small "under the hood" block per case study for the developers who look.

## 2. Concept: "Raw → Refined"

A stone crusher takes raw rock and turns it into sorted, graded material. I take raw, messy operations and turn them into structured systems. The whole site tells that one story through scroll.

- Raw side: spreadsheet cells, paper challans, rough rocks, scattered and drifting.
- Refined side: clean blocks that snap into rows, cards and charts.
- The transition between them is the signature moment of the site.

## 3. Page structure

| #   | Section                 | Content                                                      | Motion / 3D                                                                                                                            |
| --- | ----------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero                    | Headline, one-line sub, primary button                       | The signature 3D scene: raw clutter passes through a crusher shape and comes out as ordered blocks forming a dashboard. Scroll-driven. |
| 2   | Proof strip             | Four numbers                                                 | Count-up on enter                                                                                                                      |
| 3   | Case study: Crusher ERP | Problem, what I observed, what I built, result, before/after | Low-poly plant: weighbridge, conveyor, trucks. Each truck leaving becomes an invoice row, then a chart.                                |
| 4   | Case study: ClinicXpert | Same structure, link to live product                         | Calmer scene: patient tokens flow into a queue. Teal accent.                                                                           |
| 5   | How I work              | Observe → Map → Build → Hand over                            | Four steps revealed in sequence, simple line drawing                                                                                   |
| 6   | Contact                 | "Tell me how your business runs today." WhatsApp + email     | Minimal                                                                                                                                |

**Headline options to choose from**

- I turn messy operations into software that runs the business.
- From Excel sheets to a system you can run a business on.
- Raw operations in. Working software out.

## 4. The facts I can claim

Only publish what is true today, and get permission first.

This repo is public, so the crusher client's figures stay out of it until the owner approves publishing them. I keep the exact numbers in my own notes. They enter `apps/web/src/content/` in M1, and only after approval.

**Crusher billing and ERP**

- Built from scratch; replaced Excel.
- Handles billing for one plant. Monthly sales figure: pending the owner's permission. (Consider showing it in rupees for Indian clients.)
- Live at one plant, rolling out to more plants owned by the same client. Plant counts: pending the owner's permission. Say "live" and "rolling out" separately until the others are actually live.
- Manual work reduced. Size of the reduction: pending measurement and the owner's permission. State it as a measured result at this client, with how it was measured, not as a guarantee.
- Owner now has all operational data in one place, with analytics.

**ClinicXpert** (https://app.clinicxpert.in/)

- Clinic management SaaS, live.
- 6 paying clinics and growing.

**Still to gather**

- [ ] Permission from the crusher owner to publish numbers; a one or two line quote
- [ ] How the manual-work reduction was measured (hours per day before and after, or steps removed)
- [ ] A quote from one clinic
- [ ] Screen recordings of both products with dummy data (no real patient or customer data)
- [ ] One "before" artefact: a photo or recreation of the old Excel sheet
- [ ] My name, photo, short bio, contact number, email (domain: buildwithshivam.in, owned)
- [ ] The workflow map for each project (the steps of the real-world process I modelled)

## 5. Visual direction

- **Mood:** industrial, precise, calm. A quarry at dusk, not a neon tech demo.
- **Colour tokens (starting values, tune in the browser):**
  - `basalt-950` `#0B0C0E` page background
  - `basalt-900` `#131519` raised surfaces
  - `stone-600` `#5B6068` borders, muted shapes
  - `stone-400` `#9AA0A8` secondary text
  - `stone-100` `#E7E5E0` primary text
  - `signal` `#FF6A13` the one accent (safety orange)
  - `clinic` `#19B5A5` used only in the ClinicXpert section
- **Type:** Barlow Condensed for headings, Inter for body, JetBrains Mono for numbers and data.
- **3D style:** low-poly, flat-shaded, few colours. Cheap to model, light to load, and it reads as deliberate.
- **Motion rules:** one idea per section; scroll drives the story; nothing moves without a reason; every animation has a reduced-motion version; text is always real HTML, never drawn only in the canvas.

## 6. Stack

| Job                           | Tool                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Monorepo                      | pnpm workspaces + Turborepo, laid out like the crusher project                                                       |
| Framework                     | Next.js (App Router) + TypeScript, in `apps/web`                                                                     |
| API                           | Express + zod in `apps/api`, structured like crusher's API; schemas shared through `packages/contracts`              |
| Styling                       | Tailwind CSS                                                                                                         |
| 3D                            | Three.js through React Three Fiber + drei                                                                            |
| Models                        | Blender; free low-poly packs (Kenney, Poly Pizza) as a base                                                          |
| Scroll and timeline animation | GSAP + ScrollTrigger                                                                                                 |
| Smooth scroll                 | Lenis                                                                                                                |
| UI micro-motion               | Motion                                                                                                               |
| Repo, tickets, CI             | GitHub (public repo): Issues and milestones, Actions                                                                 |
| Hosting                       | Vercel Hobby (ADR 0003), two projects (web, api); a preview URL per PR, production from `main` on buildwithshivam.in |

Use the latest stable versions at install time and check that React Three Fiber supports the installed React version before the 3D spike (stage 5).

## 7. Lifecycle

The project runs the way a product team runs one: decide what and why, design how, plan, build the pipeline, retire the biggest risk, then build in milestones. Each stage has an output and an exit check. Do not start a stage until the previous one passes.

**Roles:** I write every line of code, and I decide and approve. Claude writes the planning docs after we plan each one in conversation, drafts tickets, reviews every pull request, and keeps `CLAUDE.md`, this brief and `docs/PROGRESS.md` current. For code it gives the goal, the spec, the docs links and pointers to my own crusher and clinicXpert work, never the code itself. TypeScript is learned as each step needs it. See `CLAUDE.md`.

**Left out on purpose**, because they solve team problems a solo project does not have: sprints, standups, story points, CODEOWNERS, multiple reviewers, and a separate staging environment (Vercel previews do that job).

**Stage 0: Kickoff**
Root `.gitignore`, the first commit (docs, `CLAUDE.md`, `.claude/settings.json`), a public GitHub repo, push.
_Exit:_ `main` is on GitHub with the docs on it.

**Stage 1: Requirements, `docs/PRD.md`**
What and why, not how. Problem, audience, goals, non-goals, success metrics with numbers, functional requirements (the six sections, the enquiry flow), non-functional requirements (the budget in §8, accessibility level, supported devices, SEO), constraints (client permissions, no real data), and every open question in §11 marked blocking or not. This brief is the starting material. Reference: `../clinicXpert/docs/PRD.md`.
_Exit:_ reviewed and Approved; no blocking question left open.

**Stage 2: Design**

- **System design, `docs/ARCHITECTURE.md`:** scope; one diagram of the system; each package's job; the enquiry request end to end; the API contract; rendering strategy (static HTML first, 3D client-only and lazy); how the budget is met; security (validation, rate limiting, spam, secrets, CORS); environments (local, preview, production); observability; testing strategy; a risk register. Reference: `../clinicXpert/docs/ARCHITECTURE.md` §1–3 and §8–9.
- **Decision records, `docs/adr/`:** one file per decision, with the options and trade-offs. First batch: monorepo with pnpm and Turborepo; a separate Express API or Next route handlers; where the API runs; email provider; TypeScript version. Template: `../clinicXpert/docs/adr/0000-template.md`.
- **UX design, `docs/UI_DESIGN.md`:** low-fi wireframes of the six sections at 360px and 1280px, and the hero storyboard (scroll position → what the scene shows → what text is on screen) with its reduced-motion version. Reference: `../clinicXpert/docs/UI_DESIGN.md` §1–2.

_Exit:_ all three reviewed and Approved.

**Stage 2b: Visual design** (added 2026-10-08, during M0)
A high-fidelity mockup of `UI_DESIGN.md` on a design canvas: every section at 360 and 1280 px, a style board, the headline options, the hero storyboard, the form states. Claude builds it, I review and approve. M0's design-token ticket (#9) waits for it; the other M0 tickets do not.
_Exit:_ I approve the visual design, and `UI_DESIGN.md` and `CLAUDE.md` are updated from it.

**Stage 3: Planning**
GitHub milestones M0–M6 (below). M0's tickets filed, each with acceptance criteria and a link to the doc section it implements; later milestones are ticketed when they start. The Definition of Done lives in `CLAUDE.md`.
_Exit:_ M0's tickets are filed.

**Stage 4: M0 Foundation (walking skeleton)**
The thinnest working path from a commit to production, built before any feature, so every later change travels it:

1. Workspace: root `package.json`, `pnpm-workspace.yaml`, Turborepo.
2. `packages/config`: shared tsconfig, Prettier, ESLint.
3. `apps/web`: Next.js scaffold on the shared config, an empty page.
4. CI: GitHub Actions runs install, lint, typecheck and build on every PR; a PR template; `main` accepts only PRs with green CI.
5. Deploy: Vercel connected to the repo with root `apps/web`, a preview URL per PR, production from `main`.
6. Design tokens and the three fonts.
7. `packages/contracts` and `apps/api` with the health route and one test, so CI runs tests from the first day.
8. `pnpm dev` runs web and api together.

_Exit:_ a live URL showing the background colour and the three fonts; every PR gets CI and a preview; `pnpm dev`, `pnpm lint`, `pnpm typecheck` and `pnpm test` work from the root.

**Stage 5: Spike, 3D on a real phone**
Time-boxed to two or three sessions, and thrown away: a lazy-loaded React Three Fiber canvas of flat-shaded rocks driven by scroll, in a `/lab` route on a branch that never merges. It is also where the basics get learned: canvas, mesh, light, camera, frame loop. Open its preview URL on a mid-range Android phone and measure frame rate, LCP and JavaScript size.
_Exit:_ `docs/spikes/hero-3d.md` with the numbers, and an ADR choosing the full scene, a simpler one, or a static image. The design docs are updated if the answer changes them.

**Stage 6: Build milestones**
Each ticket goes issue → branch → steps → PR → CI and preview → review → merge commit. Tests ship with the code. Each milestone ends with a demo: send the preview link to one person and note what they said.

- **M1 Content:** all copy and both case studies as typed data. _Exit:_ every section's text exists and reads well as a plain document.
- **M2 The 2D site:** layout, all six sections, responsive from 360px up, real content, a working contact path. _Exit:_ I would be comfortable sending this link to a client even with no animation.
- **M3 Motion:** Lenis, ScrollTrigger reveals, number count-ups, pinned case-study sections, reduced-motion fallbacks. _Exit:_ scroll feels smooth on a mid-range Android phone.
- **M4 Hero 3D:** the hero from primitives only (flat-shaded icosahedrons as rocks, planes as spreadsheet cells, boxes as dashboard blocks), tied to scroll, built on the spike's result. _Exit:_ the Raw → Refined transition works end to end with no Blender models.
- **M5 Project scenes:** the crusher plant and the clinic scene, modelled in Blender or adapted from free packs, exported as glTF, compressed, lazy-loaded. The launch waits for them (PRD Q5). _Exit:_ both scenes run, and each model set stays inside the budget in §8.

**Stage 7: M6 Launch readiness**
A pre-launch checklist (reference: `../crusher/docs/PRE_LAUNCH_CHECKLIST.md`): performance on a real low-end phone, static fallback for weak devices, accessibility pass, security, SEO and social preview, analytics and error tracking, sign-off from both clients on every number and quote, buildwithshivam.in pointed at production. Then a go/no-go, a soft launch to two or three people, fixes, and the public launch.
_Exit:_ budget met on a real low-end phone; every checklist item done or knowingly deferred.

**Stage 8: Post-launch**
Two to four weeks after launch: measure against the PRD's success metrics, write `docs/RETRO.md`, and open the v2 backlog as issues.

## 8. Budget and quality targets

- Largest content visible within about 2.5 seconds on a mid-range Android phone on 4G.
- 3D code and models load only after the first paint; the page is readable before they arrive.
- All models together under about 1.5 MB compressed.
- Pixel ratio capped (2 on desktop, 1.5 on phones).
- Static image shown instead of 3D when WebGL is unavailable or reduced motion is on.
- Keyboard-navigable, visible focus, sufficient contrast, alt text.

## 9. Cautions

- One excellent 3D scene beats five average ones. The hero is the priority; the project scenes come after it (M5), and the launch waits for them (PRD Q5).
- The 3D earns attention; the case studies win the client. Never let animation delay or hide the content.
- No real client data in screenshots or recordings.
- No guarantees in the copy. Results, with context.

## 10. Day 0 checklist

Done by Claude: `CLAUDE.md`, this brief, `docs/PROGRESS.md`, and `.claude/settings.json`. The settings file is the lock behind `CLAUDE.md`: Claude can edit Markdown (the docs) but no code or config file, and cannot run installs, scaffolders, write-mode formatters or git writes. It does not stop a script that opens files itself, so keep reading what a command does before approving it.

I do the rest by hand:

1. In the folder, run `git init`.
2. Start Claude Code in the folder, run `/context` and confirm `CLAUDE.md` appears under Memory files, then `/permissions` and confirm the deny rules are listed.
3. First message: "Read CLAUDE.md and docs/PROJECT_BRIEF.md, then show me the Phase 0 steps."

## 11. Open questions

Each is answered in the place in brackets.

- Is the audience mainly business owners, or also agencies and employers? (PRD) Answered: business owners only.
- Domain name? Answered: buildwithshivam.in.
- English only, or English and Hindi? (PRD) Answered: English only.
- Do I show pricing or a "how an engagement works" section? (PRD) Answered: how it works, no prices.
- Which headline? (M1)
- Where does `apps/api` run in production (Vercel functions, Render, Railway, a small VPS)? (ADR, stage 2) Answered: Vercel (ADR 0003).
- What does the API do first: an enquiry form that emails me, stores enquiries, or both? (PRD) Answered: emails me, stores nothing.
- Once the course method has run smoothly through a milestone or two, turn it into a publishable skill for project-based learning with AI. (Post-launch)
