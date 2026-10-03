# Product requirements

What the portfolio site must do, and how we will know it works. This is the product half of the design. `ARCHITECTURE.md` (stage 2) is the engineering half, and the ADRs in `adr/` carry the reasoning. Built from the kickoff brief (`PROJECT_BRIEF.md`) and the decisions taken on 2026-10-03. Where this file and a newer ADR disagree, the ADR wins.

**Status: Approved**, 2026-10-03. Written by Claude, approved by me. Q2–Q4 were decided at approval, as proposed. Amended the same day: launch waits for the project scenes (Q5); hosting stays on Vercel Hobby (ADR 0003: NFR-8, A4, Q8); the domain is buildwithshivam.in (§8, Q11); contact actions are counted from the messages (ADR 0007: G2, FR-9, FR-15).

---

## 1. The shape of it

One page at one URL. It tells one story, Raw → Refined: a business that runs on spreadsheets, paper and chat can run on a system built around how it actually works. Two case studies prove it, and the page ends in one action: get in touch.

The visitor owns a small or mid-sized business in India, reads on a phone, and is not technical. They should leave knowing what I do, believing I have done it twice, and with a one-tap way to start a conversation: WhatsApp, email, or a short form that reaches my inbox.

**Priorities, in order:** the content reads and the contact path works; then speed on a mid-range phone; then motion and 3D. Animation never delays or hides content (brief §9).

## 2. Problem

I build software around how a business actually works, and I have two systems in production to show for it: billing and ERP for a stone-crusher plant that ran on Excel, and ClinicXpert, a clinic management SaaS with paying clinics. Today there is nothing to send a prospect, or to give someone who refers me, that shows this. Prospects can't judge the work, and referrers have to explain it in their own words.

## 3. Audience

| | Who | What they need from the page |
|---|---|---|
| **Primary** | Owners of small and mid-sized businesses in India whose operations run on spreadsheets, paper or chat | To recognise their own situation, see it fixed for a business like theirs, and contact me with no effort |
| **Through the primary** | People who refer work to me | A link they can forward on WhatsApp that previews well and explains itself |
| **Served, not designed for** | Developers who look at the work | The "under the hood" block in each case study, and the public repo |

**Not the audience** (decided 2026-10-03): employers, recruiters and agencies. No resume, no "open to roles", no agency pitch.

## 4. Goals and success metrics

| ID | Goal | Metric | Target | Measured |
|---|---|---|---|---|
| G1 | A visitor understands what I do from the first screen | Five-second test: show the first screen for five seconds, then ask "what does this person do?" | 4 of 5 non-technical people answer correctly | Before launch (M6) |
| G2 | Prospects get in touch | Messages per month that came through the site (WhatsApp chats and emails carrying the site's prefilled text, plus form enquiries), and **qualified enquiries** per month: a business owner, or someone acting for one, describing an operations problem they want solved | A baseline over the first four weeks after launch; the target is set from it (Q7) | Counted by hand from WhatsApp and the inbox (FR-15, ADR 0007) |
| G3 | The page is fast on the target device | LCP, INP and CLS at the 75th percentile on mobile | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, the "good" thresholds in [web.dev: Web Vitals](https://web.dev/articles/vitals) | Lighthouse (mobile) before each milestone demo; a real mid-range Android phone on 4G at M6; field data after launch |
| G4 | Anyone can use it | WCAG 2.2 level AA | No AA failure in an automated check plus a manual keyboard and screen-reader pass | M6 checklist |
| G5 | The craft shows without costing G1–G4 | The hero scene loads after the content and runs smoothly | The hero headline, not the canvas, is the LCP element; the frame-rate target comes from the spike (stage 5) | Spike report, then the M4 demo |

## 5. Non-goals for v1

- **No Hindi** (decided). A v2 item if prospects ask for it.
- **No prices** (decided). Price is discussed on the call.
- **No stored enquiries, no database** (decided). The form emails me; the site keeps nothing.
- **No accounts, login, CMS or blog.** Content lives in typed files in the repo.
- **No resume, employer or agency content** (decided).
- **No booking calendar, chatbot or newsletter.**
- **No more than the two case studies.**
- **No 3D for its own sake.** Three scenes, the hero and one per case study, each with a static fallback, and no others.

## 6. Functional requirements

**Priority:** *Must* blocks launch. *Should* is expected at launch but can slip to v1.1 with a note in the release. *Could* ships only if time allows.

### 6.1 The page

**FR-1 One page, six sections.** *Must.* A single page at `/` with the sections in this order: Hero, Proof strip, Case study: Crusher ERP, Case study: ClinicXpert, How I work, Contact.
*Accepted when* every section's text is in the server-rendered HTML, and the page reads top to bottom with JavaScript turned off.

**FR-2 Header and skip link.** *Must.* My name, and a "Get in touch" link to Contact. A skip link to the main content is the first focusable element.

**FR-3 Not-found page.** *Should.* In the site's style, with a link home.

### 6.2 Sections

**FR-4 Hero.** *Must.*
- A headline (one of the three options in brief §3, chosen in M1), a one-line sub, and a primary button to Contact.
- A scroll-driven 3D scene: raw clutter passes through a crusher shape and comes out as ordered blocks forming a dashboard (brief §3).
- With reduced motion on, without WebGL, or if the scene fails to load, a static image of the refined state shows instead. The headline and button never wait for the scene.
- The spike (stage 5) may downgrade the scene to a simpler one or to the static image. If it does, this requirement is updated.

*Accepted when* the headline is the LCP element, and with reduced motion on nothing animates and the static image shows.

**FR-5 Proof strip.** *Must.*
- Four numbers, each with a label. Each is true on launch day and approved by the client it concerns (§8, Q1).
- *Should:* each number counts up as the strip enters the screen. The final value is in the HTML from the start, and with reduced motion it shows at once.

**FR-6 Case study: Crusher ERP.** *Must.*
- Problem, what I observed, what I built, result, before and after.
- The "before" is a photo or recreation of the old Excel sheet. The "after" uses dummy data only.
- Results are stated with how they were measured, never as a guarantee.
- An "under the hood" block: the stack and architecture in a few lines, for developers.
- The low-poly plant scene (weighbridge, conveyor, trucks; each truck leaving becomes an invoice row, then a chart), with the same static-image fallback as FR-4. The section's text never depends on it.

**FR-7 Case study: ClinicXpert.** *Must.*
- The same structure as FR-6, plus a link to the live product, https://app.clinicxpert.in/.
- The teal `clinic` accent, used in this section only.
- The calmer scene (patient tokens flow into a queue), with the same static-image fallback as FR-4.

**FR-8 How I work.** *Must.*
- Four steps: Observe → Map → Build → Hand over. For each: what happens, what the client gives and gets, and a typical duration (Q6).
- No prices (decided).
- *Should:* the steps reveal in sequence with a simple line drawing. With reduced motion they all show at once.

**FR-9 Contact.** *Must.*
- Heading: "Tell me how your business runs today."
- Three ways in, in this order (Q2): WhatsApp, which opens a chat with me with a short first message already typed that names the site; the enquiry form (FR-10); and email, which opens the mail app with a subject that names the site. The prefilled text is how contact actions are counted (FR-15).

*Accepted when* both links work on Android and iOS, and still work with JavaScript turned off.

### 6.3 Enquiry form

**FR-10 Enquiry form.** *Must.*
- Fields (Q3):
  - Name, required.
  - Phone/WhatsApp or email. At least one is required.
  - "How does your business run today?", required, free text with a length cap.
  - Business name, optional.
- The same validation rules run in the browser, for quick feedback, and in the API, which is the real check. They are one shared schema in `packages/contracts`.
- On submit, the API validates the enquiry, drops spam (FR-11) and emails it to me. The email's reply-to is the visitor's email when they gave one, so I can answer in one tap.
- **Success:** the form is replaced by a confirmation that says when I will reply (wording in M1).
- **Invalid input:** each problem shows next to its field, in text, and is announced to screen readers. Nothing typed is lost.
- **Server or network failure:** a message offers WhatsApp and email instead, and the typed text stays in the form.
- A one-line note under the form says where the message goes (my inbox) and that the site doesn't store it.

*Accepted when* a valid enquiry reaches my inbox within a minute, and an invalid one is rejected by the API even when the browser checks are bypassed, for example by posting with `curl`.

**FR-11 Spam protection.** *Must.*
- A hidden honeypot field. A submission that fills it is dropped, and the sender is shown the normal success state.
- A rate limit per IP address on the enquiry route.
- No CAPTCHA at launch: it adds friction for real owners. Revisit if spam gets through; the ADR records the trigger.

**FR-12 A failed send is never silent.** *Must:* the visitor sees the failure state in FR-10. *Should:* I am alerted, through error tracking or a log alert, so I can follow up.

### 6.4 Sharing, search and measurement

**FR-13 Link previews.** *Must.* A title, description and preview image (Open Graph), so a forwarded link shows a proper card.
*Accepted when* the card renders in WhatsApp, LinkedIn and Gmail.

**FR-14 Search basics.** *Must.* One canonical URL, a page title with my name and what I do, a meta description, `robots.txt` and a sitemap.

**FR-15 Analytics.** *Must*, because G2 depends on it. Page views and unique visitors come from Vercel Web Analytics. Contact actions are counted from the messages that arrive: WhatsApp chats and emails carrying the site's prefilled text (FR-9), plus form enquiries. No personal data is collected (ADR 0007).
*Accepted when* a WhatsApp chat and an email started from the site are recognisable by their prefilled text.

## 7. Non-functional requirements

**NFR-1 Performance** (brief §8, G3)
- LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile on mobile.
- The hero headline, not the canvas, is the LCP element.
- 3D code and models load after first paint, never in the page's initial JavaScript.
- All models together ≤ 1.5 MB compressed.
- Pixel ratio capped at 2 on desktop and 1.5 on phones.
- An initial-JavaScript budget is set in `ARCHITECTURE.md`, using the spike's numbers.

**NFR-2 Accessibility** (G4): WCAG 2.2 AA.
- **Keyboard:** every interactive element is reachable and usable, the focus is always visible, and the order follows the page.
- **Contrast:** text is at least 4.5:1, or 3:1 when large (about 24 px, or 18.5 px bold), per [SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). What identifies a control or its state, such as an input's border, is at least 3:1 against the colours next to it, per [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). The token check is below.
- **Motion:** every animation has a `prefers-reduced-motion` path, and the 3D becomes a static image.
- **Text:** text is real HTML, never drawn only in the canvas. Images have alt text. The canvas is hidden from screen readers, and its meaning is given in text.
- **Form:** every field has a visible label, and errors are tied to their fields and announced.

Token contrast, computed with the WCAG relative-luminance formula on 2026-10-03:

| Pair | Ratio | Allowed use |
|---|---|---|
| `stone-100` on `basalt-950` | 15.54 | Any text |
| `stone-400` on `basalt-950` | 7.42 | Any text |
| `stone-400` on `basalt-900` | 6.93 | Any text |
| `signal` on `basalt-950` | 6.82 | Any text |
| `clinic` on `basalt-950` | 7.64 | Any text |
| `basalt-950` on `signal` | 6.82 | Text on orange buttons: **dark text** |
| `stone-100` on `signal` | 2.28 | **Fails.** No light text on orange |
| `stone-600` on `basalt-950` | 3.09 | Large text and control borders only, never body text |
| `stone-600` on `basalt-900` | 2.89 | **Fails 3:1.** Not for a border that identifies a control on a raised surface (e.g. form inputs). The fix is a design decision for `UI_DESIGN.md` |

**NFR-3 Devices and browsers** (Q4)
- Widths from 360 px up, checked at 360, 768 and 1280 px.
- The latest two versions of Chrome (Android and desktop), Safari (iOS and macOS), Firefox and Edge.
- Without WebGL, the static image shows (FR-4).

**NFR-4 Resilience**
- **JavaScript off:** all content reads, and the WhatsApp and email links work. The form needs JavaScript, and the links are its fallback.
- **API down:** the page and the links work, and the form shows its failure state.
- **3D fails:** the static image shows, and nothing else breaks.

**NFR-5 Security**
- The API validates all form input with the shared schema before using it.
- Secrets, such as the email provider's key, live only in server environment variables: never in the repo, the browser bundle or the logs.
- Browsers can post to the API only from the site's own origin (ARCHITECTURE §5: same origin, no CORS headers).
- Rate limit and honeypot (FR-11).
- Standard security headers on the web app and the API.
- The repo is public, so no secret, client data, or real customer or patient data appears in any commit, screenshot or fixture.

**NFR-6 Privacy**
- Enquiries are emailed, not stored. Logs never contain a message body or contact details.
- Analytics collect no personal data.
- Screenshots and recordings use dummy data only.

**NFR-7 Maintainability**
- All copy and case-study content lives in typed data files under `apps/web/src/content/`, so changing a number or a quote touches one file.
- Every change reaches `main` through a PR with green CI: lint, typecheck, build and tests.

**NFR-8 Cost:** ₹0 a month: Vercel Hobby before and after launch (ADR 0003), Resend's free plan (ADR 0004), and the domain I already own (A4).

## 8. Content and permissions

Brief §4 sets the facts the site may claim and the rules for claiming them. This table covers what's still needed, from whom, and by when:

| Item | From | Needed by | If it doesn't arrive |
|---|---|---|---|
| Permission to publish the crusher figures, and a one- or two-line quote | Crusher client | M1 | The crusher case study ships with qualitative results only, and the proof strip uses other numbers |
| How the manual-work reduction was measured | Me, with the client | M1 | The result is left out |
| A quote from one clinic | A ClinicXpert clinic | M1 | Ship without a clinic quote |
| Screen recordings of both products, with dummy data | Me | M2 | Static screenshots with dummy data |
| One "before" artefact: the old Excel sheet, a photo or a recreation | Me, with the client | M2 | A recreation, labelled as one |
| Name, photo, short bio, contact number, email | Me | M1 | None. This blocks launch |
| Workflow map for each project | Me | M1 | None. The "what I observed" parts need it |

ClinicXpert's paying-clinic count is mine to publish. The rest of the proof strip depends on the first row (Q1).

## 9. Constraints

- I write all the code by hand, as a learning project (`CLAUDE.md`). The schedule follows that pace.
- The stack is fixed in brief §6. `apps/api` is a separate Express app: it is a learning goal as well as the form's backend. `ARCHITECTURE.md` and an ADR weigh it against Next.js route handlers.
- The repository is public.
- Only facts that are true on launch day, with permission (brief §4).

## 10. Assumptions

Check these after launch, using analytics and enquiries.

- **A1** Most visitors are on phones, arriving from a forwarded link or a search for my name.
- **A2** English works for the owners I want to reach (decided). Revisit if prospects ask for Hindi.
- **A3** Owners prefer WhatsApp to a form, so WhatsApp leads the contact options.
- **A4** Vercel Hobby's caps and Resend's free plan cover launch traffic and enquiry volume (ADR 0003, ADR 0004).
- **A5** Withdrawn 2026-10-03: the launch waits for the project scenes (Q5).

## 11. Open questions

| # | Question | Blocks | Proposed answer |
|---|---|---|---|
| Q1 | Which four numbers go in the proof strip? | M1 | Decide once the crusher owner answers (§8) |
| Q2 | Contact order: WhatsApp, then the form, then email? | Decided 2026-10-03 | Yes, per A3 |
| Q3 | The form fields in FR-10? | Decided 2026-10-03 | Yes |
| Q4 | The browser list in NFR-3? | Decided 2026-10-03 | Yes |
| Q5 | Launch without the project scenes? | Decided 2026-10-03 | No. Launch after everything is built: the project scenes are M5, launch is M6 (brief §7) |
| Q6 | Typical duration of each "How I work" step | M1 | Taken from the two projects |
| Q7 | Target qualified enquiries per month | Four weeks after launch | Set from the baseline |
| Q8 | Monthly budget for hosting and email | Decided 2026-10-03 | ₹0: Vercel Hobby throughout (ADR 0003) |
| Q9 | Target launch date | Nothing | None set; planning is easier with one |
| Q10 | Which headline | M1 | One of the three in brief §3 |
| Q11 | Domain | Decided 2026-10-03 | buildwithshivam.in, already owned. Verified with Resend before the M2 form ticket (ADR 0004) |

## 12. Later (v2 candidates)

Hindi; stored enquiries or a small CRM; more case studies; a "notes from the field" blog.
