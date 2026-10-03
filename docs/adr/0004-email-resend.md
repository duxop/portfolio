---
id: 0004
title: Send enquiry emails with Resend
status: accepted
date: 2026-10-03
needed-by: M2
reversibility: easy
decided-by: shivam
---

## Context

PRD FR-10 emails every enquiry to me, and nothing is stored (PRD §5). Expected volume is a handful of messages a week, plus whatever spam gets past FR-11. The sending credential sits in the API's environment (NFR-5), so what a leaked credential can do matters.

## Options

### Option 1: Resend

- **Pros:**
  - An HTTP API with a send-only API key.
  - The free plan is "$0/mo" for "3,000" emails a month and is "limited to 100 emails per day" ([Resend pricing](https://resend.com/pricing)).
  - Test recipient addresses such as `delivered@resend.dev` let tests and previews exercise sending without real mail ([testing addresses](https://resend.com/docs/knowledge-base/what-email-addresses-to-use-for-testing)).
- **Cons:**
  - It needs a domain: you "must add and verify at least one domain to send emails with Resend" ([Domains](https://resend.com/docs/dashboard/domains/introduction)). buildwithshivam.in is already owned, so this costs only adding DNS records at the registrar.
  - The 100-a-day cap is also the ceiling a spam flood could exhaust (risk R5).
- **Cost to reverse:** easy. Sending sits behind one function in `service.ts`.

### Option 2: Gmail SMTP with an app password, through Nodemailer

- **Pros:** no domain needed; free; mail goes from my account to my account.
- **Cons:** the credential is a password for the whole mailbox, not a send-only key, so a leak exposes my inbox. It adds an SMTP library. Google's sending limits were not checked for this ADR.
- **Cost to reverse:** easy.

### Option 3: Amazon SES

- **Pros:** familiar from crusher's AWS setup; built for application email.
- **Cons:** identity verification and a sandbox to leave before sending freely; an AWS account and IAM policy to manage for one email a day. Not priced for this ADR.
- **Cost to reverse:** easy.

## Recommendation

Option 1. It gives a send-only key, enough free volume, and test addresses for previews. The domain it needs is already owned. Option 2's one advantage, not needing a domain, no longer applies, and its credential opens the whole mailbox.

## Decision

Option 1, as recommended (2026-10-03).

## Consequences

- **Before the M2 form ticket:** verify buildwithshivam.in with Resend, following its add-a-domain guide.
- **Email addresses:**
  - From: `enquiries@buildwithshivam.in`.
  - To: my inbox, in the `ENQUIRY_TO` variable.
  - Reply-to: the visitor's email, when they gave one (FR-10).
- **Previews** send to my inbox with the environment in the subject line. The API's tests never call Resend; they use a fake sender (ARCHITECTURE §9).

## Revisit when

- Legitimate enquiries plus spam come within 20% of the 100-a-day cap on any day: tighten FR-11 first, then consider the paid plan.
- Resend's free plan changes.
