---
id: 0003
title: Host on Vercel's Hobby plan
status: accepted
date: 2026-10-03
needed-by: M0
reversibility: easy
decided-by: shivam
---

## Context

The site needs hosting for two deployables (ADR 0002), with a preview per PR and production from `main`. The PRD sets the running cost at ₹0 (NFR-8), and the domain, buildwithshivam.in, is already owned. Vercel's [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage) (last updated 2026-09-14) say: "Hobby teams are restricted to non-commercial personal use only." Commercial use is defined as "any Deployment that is used for the purpose of financial gain of anyone involved in any part of the production of the project". The examples include "Advertising the sale of a product or service".

## Options

### Option 1: Vercel Hobby, before and after launch

- **Pros:** ₹0. One platform throughout:
  - zero-config Express ([Express on Vercel](https://vercel.com/docs/frameworks/backend/express), 2026-08-10);
  - a preview per PR;
  - WAF rate limiting ([WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), 2026-08-28).
- **Cons:**
  - The fair-use wording above may cover a freelance site.
  - Hobby limits apply after launch too:
    - one rate-limit rule per project;
    - Web Analytics without custom events, with a one-month window (ADR 0007);
    - the usage caps in the fair use guidelines, with no way to buy more.
- **Cost to reverse:** easy. Upgrading is a billing change.

### Option 2: Hobby while building, Pro from launch

- **Pros:** clear of the commercial clause once the site is public. Pro is "$20/mo" with "a $20 included credit to use across resources" ([Vercel pricing](https://vercel.com/pricing)).
- **Cons:** $20 a month from launch.
- **Cost to reverse:** easy.

### Option 3: Netlify

- **Pros:** a free plan with 300 credits; the terms page checked shows no commercial restriction.
- **Cons:** Express needs a wrapper. Rate limiting and analytics need other tools. Next 16 is not named in its adapter docs ([Netlify: Next.js](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/), 2026-02-04).
- **Cost to reverse:** costly once the pipeline is built around it.

### Rejected outright

- **Render's free tier for the API:** it sleeps after 15 minutes idle and takes "about one minute" to wake ([Render: Free](https://render.com/docs/free)). That fails FR-10.
- **Cloudflare Workers:** the recommended Next.js path, vinext, "is in beta" ([Cloudflare: Next.js](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), 2026-08-25).

## Recommendation

Prepared before the decision: Option 2, so the public site is clear of the commercial clause.

## Decision

Option 1, the owner's call (2026-10-03): "lets keep it as a hobby and we will be using vercel for free now. Leave that to me, if we face some issue we will see then."

## Consequences

- **Two Vercel projects from one repo:** `web` (root `apps/web`) and `api` (root `apps/api`). They are linked with Related Projects (ARCHITECTURE §6) and production uses buildwithshivam.in.
- **Hobby limits shape the design:**
  - one rate-limit rule per project (ADR 0006);
  - page views but no custom events, so contact actions are counted from the messages themselves (ADR 0007, PRD FR-15).
- **If Vercel raises the commercial clause,** the owner decides between Option 2 and a move. Nothing in the code is tied to Hobby, so either is a billing or config change.

## Revisit when

- Vercel contacts the account about commercial use, or pauses a project.
- A Hobby usage cap is reached.
- A feature the site needs is Pro-only.
