---
id: 0006
title: Stop spam with a honeypot and a Vercel WAF rate-limit rule
status: deciding
date: 2026-10-03
needed-by: M2
reversibility: easy
decided-by:
---

## Context

PRD FR-11 requires a honeypot, a per-IP rate limit and no CAPTCHA at launch. The API runs as a single Vercel Function that scales with traffic ([Express on Vercel](https://vercel.com/docs/frameworks/backend/express)). A counter held in memory lives in one instance, so it is not a dependable limit across instances. Crusher's API uses in-process rate limiters (`../crusher/apps/api/src/app.ts:75`) because it runs as a long-lived server.

## Options

### Option 1: a honeypot in the API, plus one Vercel WAF rate-limit rule

- **Pros:**
  - The limit is enforced by the platform before the function runs, so a flood costs no function time.
  - "Available on all plans": Hobby allows one rate-limit rule per project, a fixed window of 10 seconds to 10 minutes, and counting keys IP or JA4 ([WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), 2026-08-28).
  - No code and no extra service.
- **Cons:**
  - The rule lives in the Vercel dashboard, not the repo, so it must be written down (ARCHITECTURE §5) and re-checked after changes.
  - "Rate limit counters are tracked on a per-region basis."
  - Local development has no rate limit.
- **Cost to reverse:** easy.

### Option 2: `express-rate-limit` with its default in-memory store

- **Pros:** in code and testable; the same tool as crusher.
- **Cons:** each instance counts on its own, and an instance's memory doesn't outlive it. The limit is real on one long-lived server and approximate on Vercel.
- **Cost to reverse:** easy.

### Option 3: `express-rate-limit` with a shared store (a hosted Redis)

- **Pros:** an exact limit across instances, kept in code.
- **Cons:** another service, account and secret, for a form that gets a few messages a week.
- **Cost to reverse:** easy.

### Option 4: a CAPTCHA or challenge

- **Cons:** the PRD rules it out at launch, because it adds friction for the owners the site is for.

## Recommendation

Option 1. Put the rule on the **web** project, for `POST /api/v1/enquiries`, keyed by IP. Visitors' requests enter there, so it sees their real address. The honeypot stays in the API, where tests can cover it.

## Decision

Pending your review.

## Consequences

- **The honeypot:** a hidden form field. A request that fills it gets the normal `202`, nothing is sent, and only a count is logged (ARCHITECTURE §4).
- **The WAF rule** is created in the dashboard when the form ships (M2). Its settings are recorded in ARCHITECTURE §5.
- **Risk R3:** the API project's own URL is public, so a bot posting there directly skips the web project's rule. The API project can have its own rule, since Hobby allows one per project. Whether it can key on the visitor's IP behind the proxy is checked at the M2 form ticket.

## Revisit when

- More than five spam enquiries arrive in a week: add a minimum time-to-submit check, then a challenge.
- Any day's enquiries come within 20% of Resend's daily cap (ADR 0004).
