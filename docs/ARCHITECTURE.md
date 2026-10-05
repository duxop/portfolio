# Architecture

How the portfolio site is built and run. This is the engineering half of the design; [`PRD.md`](PRD.md) is the product half, and the ADRs in [`adr/`](adr/) carry the reasoning. Where this file and a newer ADR disagree, the ADR wins.

**Status: Approved**, 2026-10-03. Written by Claude, approved by me. Facts about third-party services carry the date the docs were checked.

---

## 1. The system in one picture

```
 Visitor's phone
   │  GET /                     static HTML, CSS, fonts, a little JS
   │  POST /api/v1/enquiries    same origin, JSON
   ▼
 Vercel project "web"  (apps/web, Next.js)
   │  • serves the prerendered page
   │  • WAF rule: rate-limits POST /api/v1/enquiries by IP      (ADR 0006)
   │  • rewrite: /api/* → the "api" project                     (§4)
   ▼
 Vercel project "api"  (apps/api, Express as one Vercel Function)
   │  • validates with the shared schema (packages/contracts)
   │  • drops honeypot spam
   │  • sends the email                                         (ADR 0004)
   ▼
 Resend ──► my inbox
```

There is no database and nothing is stored (PRD §5). There are two deployables, one schema, and one external service.

## 2. Monorepo map

| Package                                       | Job                                             | Depends on            | Runs as                                    |
| --------------------------------------------- | ----------------------------------------------- | --------------------- | ------------------------------------------ |
| `apps/web` (`@portfolio/web`)                 | The page: content, layout, motion, 3D, the form | `contracts`, `config` | Vercel project `web`; prerendered at build |
| `apps/api` (`@portfolio/api`)                 | `GET /api/v1/health`, `POST /api/v1/enquiries`  | `contracts`, `config` | Vercel project `api`; one Vercel Function  |
| `packages/contracts` (`@portfolio/contracts`) | The enquiry schema (zod) and its inferred types | —                     | A library, imported by both apps           |
| `packages/config` (`@portfolio/config`)       | Shared tsconfig, ESLint and Prettier config     | —                     | Dev-time only                              |

Layout and tooling: ADR 0001. Why the API is separate: ADR 0002. Versions: the latest stable releases at install time, except TypeScript, pinned to 6.0.x (ADR 0005), pnpm, pinned to 10.34.6 (ADR 0008), and ESLint, pinned to 9.39.5 (ADR 0009). Node is 22 LTS. On 2026-10-03, npm's latest versions were: next 16.3.8, react 19.3.0, express 5.2.1, zod 4.6.5, tailwindcss 4.3.3, turbo 2.11.7, eslint 10.12.0, typescript-eslint 8.71.0. Re-check them at install.

Version differences from crusher worth knowing before the API work:

- **Express 5:**
  - rejected promises reach the error handler on their own, so there is no `async-handler.ts`;
  - `req.body` is `undefined` unless a body parser ran;
  - wildcard routes need a name.

  See the [Express 5 migration guide](https://expressjs.com/en/guide/migrating-5.html).

- **zod 4:**
  - `z.email()` replaces `z.string().email()`;
  - an `error` param replaces `message`;
  - `z.treeifyError()` replaces `.format()` and `.flatten()`.

  See the [zod 4 migration guide](https://zod.dev/v4/changelog).

## 3. Rendering and loading

The page has no request-time data. All copy lives in typed files under `apps/web/src/content/`, so Next.js prerenders `/` as static HTML at build time, and Vercel serves it from its CDN.

**Server components by default.** A component becomes a client component only when it needs the browser. That leaves:

- the enquiry form;
- the scroll and motion setup (Lenis, GSAP, ScrollTrigger, Motion);
- the 3D canvas.

**Load order.** Each stage is useful without the next:

1. **HTML, CSS and fonts** (`next/font`). The hero headline is the LCP element (PRD NFR-1). Every section's text is here, so the page reads with JavaScript off (FR-1).
2. **Hydration** of the form and the header. The WhatsApp and email links never needed JavaScript.
3. **Motion**, after hydration. With `prefers-reduced-motion`, nothing animates and every element sits in its final state.
4. **3D**, last: a separately loaded chunk (`next/dynamic`, client-only), requested only when WebGL is available and reduced motion is off. A static image of the refined state is in the HTML from the start; the canvas replaces it once ready, and the image stays if the chunk fails (FR-4, NFR-4).

**Budgets** (PRD NFR-1):

- LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at p75 on mobile.
- Models ≤ 1.5 MB compressed in total.
- Pixel ratio capped at 2 on desktop and 1.5 on phones.
- An initial-JavaScript budget is set here after the spike (stage 5) measures what the scene costs.

## 4. The enquiry, end to end

1. The visitor fills the form (FR-10). The browser checks the fields as the visitor types. Whether that check uses the zod schema or native HTML constraints is decided at the M2 form ticket, after measuring what zod adds to the client bundle.
2. The browser sends `POST /api/v1/enquiries` with a JSON body to **its own origin**. The browser never knows the API's host.
3. The `web` project's WAF rule counts the request by IP. Above the limit, it answers `429` and the function never runs (ADR 0006).
4. The Next.js rewrite proxies `/api/:path*` to the `api` project ([rewrites → external URL](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), 16.3.8). §6 covers how the destination host is found in each environment.
5. Express parses JSON with a small size limit, then the `enquiries` router validates the body with the shared schema. Anything malformed or invalid becomes an `AppError`, which the error handler turns into a response.
6. If the honeypot field is filled, the API responds `202`, sends nothing, and logs only that a honeypot was hit.
7. `service.ts` builds the email and calls the sender:
   - from: `enquiries@buildwithshivam.in`;
   - to: `ENQUIRY_TO`;
   - reply-to: the visitor's email, if they gave one;
   - subject: names the environment outside production.
8. The sender succeeds and the API responds `202`. The form shows its confirmation.
9. The sender fails (network error, a Resend error, or the daily cap) and the API responds `502`. The form shows its failure state with the WhatsApp and email links, and keeps the typed text (FR-10, FR-12).

### API contract

**`GET /api/v1/health`** → `200 {"status":"ok"}`. Dependency-free, as in crusher.

**`POST /api/v1/enquiries`**

Request body (JSON):

| Field      | Rule                                       |
| ---------- | ------------------------------------------ |
| `name`     | Required, 1–100 characters, trimmed        |
| `phone`    | Optional, a phone number in a loose format |
| `email`    | Optional, a valid email                    |
| (both)     | At least one of `phone` or `email`         |
| `message`  | Required, 1–2,000 characters               |
| `business` | Optional, ≤ 100 characters                 |
| `website`  | The honeypot. Must be empty or absent      |

The lengths and the phone format are proposals, finalised in the contracts ticket.

| Response               | When                                     | Body                                           |
| ---------------------- | ---------------------------------------- | ---------------------------------------------- |
| `202`                  | Sent, or a honeypot hit                  | none                                           |
| `400 BAD_REQUEST`      | Malformed JSON, or a body over the limit | error envelope                                 |
| `422 VALIDATION_ERROR` | The schema failed                        | error envelope, with field errors in `details` |
| `429`                  | The WAF limit was hit                    | Vercel's default                               |
| `502 UPSTREAM_FAILED`  | The email could not be sent              | error envelope                                 |
| `500 INTERNAL`         | Anything unexpected                      | error envelope, with no internals              |

The error envelope follows crusher's (`../crusher/apps/api/src/middleware/error-handler.ts`): `{ "error": { "code", "message", "details"? } }`. `AppError` follows `../crusher/apps/api/src/http-error.ts`, trimmed to the four codes above plus `NOT_FOUND`, and adds `UPSTREAM_FAILED → 502`.

## 5. Security

Each item maps to PRD NFR-5.

- **Validation:** the API validates every body with the shared schema before use. The browser check is only for quick feedback.
- **Same origin, no CORS:** the browser calls only its own origin, so the API sends no CORS headers. A browser on another origin can't send the JSON request either, because its preflight has nothing to allow it. CORS was never a defence against non-browser clients, which is what the WAF rule and the honeypot are for.
- **Rate limit, recorded here because it lives in the dashboard (ADR 0006).** The rule is set on project `web` at M2:
  - condition: path `/api/v1/enquiries` and method `POST`;
  - key: IP;
  - fixed window: 10 minutes;
  - limit: 5 requests;
  - action: 429.

  The window and limit are proposals, tuned at M2.

- **Secrets:** `RESEND_API_KEY` exists only in the `api` project's environment, never in `apps/web`, the repo, or a log. `env.ts` parses every variable with zod at startup and fails fast.
- **Headers:** standard security headers on both projects: `helmet` on the API, as in crusher, and the `headers` option in `next.config` on the web. The exact set is decided at M2.
- **Logs (NFR-6):** never a message body, name, phone or email. Each log line carries a request ID, the outcome, the duration, and whether the honeypot was hit.
- **Public repo:** no secret, client data, or real customer or patient data in any commit, fixture or screenshot.

## 6. Environments and configuration

|                       | Local                                                 | Preview (every PR)                            | Production (`main`)                    |
| --------------------- | ----------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Web                   | `next dev` on :3000                                   | `web` preview URL                             | `web` production on buildwithshivam.in |
| API                   | `tsx watch` on :4000                                  | `api` preview URL                             | `api` production                       |
| How web finds the API | `API_ORIGIN` (see below)                              | Related Projects: the matching `api` preview  | Related Projects: `api` production     |
| Email goes to         | Resend test address, or my inbox when testing by hand | My inbox, subject marked with the environment | My inbox                               |
| Vercel plan           | —                                                     | Hobby (ADR 0003)                              | Hobby (ADR 0003)                       |

**Related Projects** ([Vercel: Using Monorepos](https://vercel.com/docs/monorepos), 2026-08-11):

- `apps/web/vercel.json` lists the `api` project's ID.
- Each deployment then gets `VERCEL_RELATED_PROJECTS`, and `withRelatedProject({ projectName, defaultHost })` from `@vercel/related-projects` returns the right host.
- The package runs only in `next.config`, never in the browser bundle.
- Limits: up to three linked projects, same repository, Git deployments only.
- With Turborepo's strict env mode, `VERCEL_RELATED_PROJECTS` must be listed in `turbo.json`.

**Locally, the default host comes from `API_ORIGIN`.** Where that value lives is decided at the M0 ticket. Crusher committed a non-secret `apps/*/.env.development` (`../crusher/docs/PRE_LAUNCH_CHECKLIST.md` §3, amendment 1), which here would need a `.gitignore` exception. The alternative is a `.env.local` that each clone creates.

**Variables**

| Variable                  | Where              | Secret | Purpose                                             |
| ------------------------- | ------------------ | ------ | --------------------------------------------------- |
| `RESEND_API_KEY`          | api                | Yes    | Send email (ADR 0004)                               |
| `ENQUIRY_TO`              | api                | No     | My inbox                                            |
| `ENQUIRY_FROM`            | api                | No     | Sender address, e.g. `enquiries@buildwithshivam.in` |
| `PORT`                    | api, local only    | No     | Defaults to 4000                                    |
| `API_ORIGIN`              | web, local only    | No     | Rewrite destination when Related Projects is absent |
| `VERCEL_RELATED_PROJECTS` | web, set by Vercel | No     | Rewrite destination on Vercel                       |

Resend sends only from a verified domain, so buildwithshivam.in is verified with Resend before the M2 form ticket (ADR 0004).

## 7. Observability

- **Logs:** the API writes one structured JSON line per request to Vercel's runtime logs, following §5's rules.
- **Alerting on failed sends (FR-12, Should):** chosen at M6, launch readiness. The candidates are Sentry, which crusher uses (`../crusher/apps/api/src/sentry.ts`), and Vercel's own log alerts. Until then a failed send is visible to the visitor and in the logs.
- **Analytics:** page views and visitors from Vercel Web Analytics on Hobby. Contact actions are counted from the messages' prefilled text (ADR 0007).
- **Performance:** a Lighthouse mobile run before each milestone demo; a real mid-range Android phone on 4G at M6; field data after launch (PRD G3).

## 8. CI/CD

- **On every PR:** GitHub Actions runs `pnpm install --frozen-lockfile`, then `lint`, `typecheck`, `build` and `test` through Turborepo. Reference: `../clinicXpert/.github/workflows/ci.yml`.
- **Merging:** `main` accepts only PRs with green CI, merged with a merge commit (`CLAUDE.md`). Which branch-protection features the free plan allows on a public repo is checked at the M0 CI ticket.
- **Deploys:** Vercel builds a preview of each affected project for every push to a PR, and deploys production from `main`. Projects a commit doesn't touch are skipped automatically when workspace dependencies are declared (ADR 0001).
- **Entry file (risk R4):** Vercel finds the Express entry by looking for a file that imports `express`, at `app.*`, `index.*` or `server.*`, at the root or in `src/` ([Express on Vercel](https://vercel.com/docs/frameworks/backend/express), 2026-08-10). Crusher's layout has both `src/app.ts` (which builds the app) and `src/index.ts` (which listens). The first API deploy (M0) checks which one Vercel picks; renaming `app.ts` removes the ambiguity if needed.

## 9. Testing

Tests ship with the code (brief §7) and run in CI.

| Package     | Tool                                | What                                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contracts` | Vitest                              | The schema accepts a valid enquiry; rejects a missing name, a message that's too long, and neither phone nor email; treats a filled honeypot as a separate case                                                                                                                                                        |
| `api`       | Vitest + supertest on `createApp()` | Health is 200. A valid enquiry is 202 and calls the sender once with the right fields. Invalid is 422 with field errors. Malformed JSON is 400. The honeypot gives 202 with no send. A sender failure is 502. Logs never contain the message body. The sender is a fake passed into the app, so tests never send email |
| `web`       | Playwright smoke test (from M2)     | The page renders the headline. The contact links have the right `href`s. The form shows success and failure with the API mocked. An axe accessibility check runs on the page                                                                                                                                           |

Crusher's API tests (`../crusher/apps/api/tests`) are the reference for the supertest setup.

## 10. Risks

| #   | Risk                                                                                    | Impact                                  | Mitigation                                                                                               | When    |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| R1  | The hero scene is too heavy for a mid-range Android phone                               | Fails G3 and G5                         | The spike measures it on a real phone first. The static image is always the fallback. ADR from the spike | Stage 5 |
| R2  | The crusher client doesn't approve the figures                                          | A weaker case study                     | Qualitative version ready (PRD §8)                                                                       | M1      |
| R3  | Bots post directly to the API's `*.vercel.app` URL, skipping the web project's WAF rule | Spam; Resend's cap used up              | Honeypot. A WAF rule on the `api` project too. Check what IP the API sees behind the proxy               | M2      |
| R4  | Vercel picks the wrong Express entry file                                               | The API deploy fails or serves nothing  | Check on the first deploy; rename `src/app.ts` if needed                                                 | M0      |
| R5  | A spam flood exhausts Resend's 100-a-day cap                                            | Real enquiries fail that day            | R3's mitigations. The failure state offers WhatsApp and email. Alerting (FR-12)                          | M2, M6  |
| R6  | Vercel applies its non-commercial clause to the site                                    | Projects paused until upgraded or moved | Owner's call, handled if it happens. Nothing in the code is tied to Hobby (ADR 0003)                     | —       |
| R7  | Learning pace stretches the schedule                                                    | Late launch                             | Milestones ship on their own. M2 is already a site worth sending                                         | Ongoing |
| R8  | A free tier or price changes                                                            | Cost or a feature lost                  | ADRs record dates and revisit triggers                                                                   | Ongoing |

## 11. Decision index

| ADR                                                | Decision                                                          | Status   |
| -------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| [0001](adr/0001-monorepo-pnpm-turborepo.md)        | Monorepo on pnpm workspaces and Turborepo                         | Accepted |
| [0002](adr/0002-separate-express-api.md)           | The enquiry endpoint lives in a separate Express app              | Accepted |
| [0003](adr/0003-hosting-vercel-hobby.md)           | Vercel Hobby, before and after launch                             | Accepted |
| [0004](adr/0004-email-resend.md)                   | Send enquiry emails with Resend from buildwithshivam.in           | Accepted |
| [0005](adr/0005-typescript-6.md)                   | Pin TypeScript 6.0                                                | Accepted |
| [0006](adr/0006-spam-and-rate-limiting.md)         | Honeypot and a Vercel WAF rate-limit rule                         | Accepted |
| [0007](adr/0007-analytics-vercel-web-analytics.md) | Page views from Vercel; contact actions counted from the messages | Accepted |
| [0008](adr/0008-pnpm-10.md)                        | Pin pnpm 10.34.6 with the `packageManager` field                  | Accepted |
| [0009](adr/0009-eslint-9.md)                       | Pin ESLint 9.39.5, because Next's lint plugins stop at ESLint 9   | Accepted |

Still to decide, each at the milestone named: the alerting tool (M6), the security header set (M2), the browser-side validation approach (M2), where `API_ORIGIN` lives locally (M0), and the initial-JavaScript budget (after the spike).
