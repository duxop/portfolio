---
id: 0002
title: The enquiry endpoint lives in a separate Express app
status: accepted
date: 2026-10-03
needed-by: M0
reversibility: easy
decided-by: shivam
---

## Context

The enquiry form (PRD FR-10) needs server code: validate, filter spam, send an email with a secret key. Next.js can run that inside `apps/web` as a route handler. The brief instead names a separate Express app in `apps/api`, structured like crusher's API. This ADR makes the trade-off explicit.

## Options

### Option 1: a route handler inside `apps/web`

- **Pros:** one deployable and one Vercel project. Same origin without a proxy. No second cold start. The least code and configuration.
- **Cons:** does not practise the Express structure (`createApp()`, routers, `AppError`, an error handler, `env.ts`) that crusher uses and that this project set out to learn.
- **Cost to reverse:** easy.

### Option 2: a separate Express app in `apps/api`

- **Pros:** practises crusher's API structure end to end, including deploying and operating a second service. The API can be tested in isolation with supertest against `createApp()`.
- **Cons:**
  - A second Vercel project.
  - A proxy so the browser stays same-origin (ARCHITECTURE §4).
  - Linking previews with Related Projects (ARCHITECTURE §6).
  - The API's own `*.vercel.app` URL is public, so it can be hit directly (risk R3).
  - Express 5 differs from crusher's Express 4 ([migration guide](https://expressjs.com/en/guide/migrating-5.html)):
    - rejected promises in handlers reach the error handler on their own, so crusher's `async-handler.ts` is not needed;
    - `req.body` is `undefined` unless a body parser ran;
    - wildcard routes must be named.
- **Cost to reverse:** easy. One route moves into a route handler.

### Option 3: a Next.js server action

- **Pros:** the least code of all.
- **Cons:** the same learning gap as Option 1. It also ties the form to React's action model, so the API cannot be tested with plain HTTP calls.
- **Cost to reverse:** easy.

## Recommendation

Judged on this product alone, Option 1 is simpler. Option 2 is chosen anyway, because building and running an API the crusher way is an explicit learning goal of this project (`CLAUDE.md`, brief §6). The extra cost is bounded: one resource, two routes.

## Decision

Option 2, from the setup decisions of 2026-10-03: "`apps/api` (Express, crusher style) from Phase 0".

## Consequences

- Two Vercel projects, `web` and `api` (ADR 0003). The web app proxies `/api/*` to the API.
- The convention list in `CLAUDE.md` drops `async-handler.ts` for Express 5.
- Risk R3 (direct hits on the API's URL) and R4 (Vercel's choice of entry file) are tracked in ARCHITECTURE §10.

## Revisit when

If the API is still the single enquiry route at launch (M6) and the proxy or the second project has caused a production incident, move the route into `apps/web` (Option 1).
