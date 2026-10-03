---
id: 0007
title: Page views from Vercel Web Analytics, contact actions counted from the messages
status: accepted
date: 2026-10-03
needed-by: M2
reversibility: easy
decided-by: shivam
---

## Context

PRD G2 measures how many prospects get in touch, and FR-15 needs page views and unique visitors. No personal data may be collected (NFR-6), and nothing may slow the page down (NFR-1). Hosting stays on Vercel Hobby after launch (ADR 0003). On Hobby, Web Analytics includes "50,000 events / month", has no custom events, and keeps a one-month reporting window ([Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing), 2026-08-25).

## Options

### Option 1: Vercel Web Analytics for page views; contact actions counted from the messages

Page views and visitors come from Vercel. Contact actions are counted from what actually arrives:

- the WhatsApp link opens a chat with a prefilled first message that names the site;
- the email link prefills a subject that names the site;
- form enquiries arrive by email.

Each month I count the chats and emails carrying the site's marker.

- **Pros:** ₹0, with no extra script or account. It counts conversations that actually started, which is what G2 is about, instead of taps that may go nowhere. No personal data enters analytics.
- **Cons:**
  - A visitor can delete the prefilled text, so the count is a floor.
  - Taps without a message are invisible.
  - The one-month window means the monthly numbers must be written down by hand.
- **Cost to reverse:** easy.

### Option 2: Google Analytics 4

- **Pros:** free; custom events for every tap; long retention.
- **Cons:** a third-party script and cookies on a page with a 2.5 s budget on a mid-range phone. Cookies raise a consent question the site otherwise avoids.
- **Cost to reverse:** easy.

### Option 3: a separate privacy-focused service (hosted or self-run)

- **Pros:** custom events independent of the host.
- **Cons:** another account and script. Not priced for this ADR.
- **Cost to reverse:** easy.

## Recommendation

Option 1. It meets FR-15 and G2 at ₹0, and it measures conversations rather than clicks.

## Decision

Option 1, as recommended (2026-10-03).

## Consequences

- PRD FR-9 and FR-15 require the prefilled WhatsApp text and email subject to name the site.
- At the end of each month I record page views, visitors and the counted messages, kept outside the public repo. G2's four-week baseline starts at launch (M6).
- No analytics events are written in code. `@vercel/analytics` is the only analytics dependency.

## Revisit when

- The counts look implausibly low next to page views: test whether visitors delete the prefilled text.
- The site moves to Pro, which brings custom events.
