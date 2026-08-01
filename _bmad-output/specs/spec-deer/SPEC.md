---
id: SPEC-deer
companions:
  - glossary.md
  - ../../planning-artifacts/ux-designs/ux-deer-2026-08-01/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-deer-2026-08-01/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/architecture/architecture-deer-2026-08-01/SOLUTION-DESIGN.md
  - ../../project-context.md
sources:
  - ../../planning-artifacts/prds/prd-deer-2026-08-01/prd.md
  - ../../planning-artifacts/prds/prd-deer-2026-08-01/addendum.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Deer — Landing + Quiz di Assaggio (first public slice)

## Why

**A vision to realize, validated cheaply before committing further.** Deer helps newly-graduated pharmacists pass the public exam that assigns pharmacy licenses. The problem is not access to the 3000 official questions — they're public — it's *remembering* them under exam pressure. Deer's answer is a mnemonic paired with every question. Before building the full product (3000 questions, personal area, payments), the PO needs a real signal that this method actually lands with visitors. This slice is that signal-gathering instrument: a public landing page plus a 10-question no-login "taste quiz" that lets a visitor *experience* the mnemonic instead of reading a claim about it, ending in a lightweight feedback + optional email capture.

## Capabilities

- **CAP-1** — Hero with CTA to quiz
  - **intent:** Visitor sees the hero (headline, subheadline, CTA, microcopy, trust bar) and starts the quiz in one tap/click, no intermediate step.
  - **success:** Clicking the primary CTA lands directly on question 1/10 (no form, no confirmation). Sticky header keeps a compact CTA reachable through scroll.

- **CAP-2** — Comparison section (traditional method vs Deer)
  - **intent:** Visitor reads the mnemonic-vs-rereading contrast before deciding to start the quiz.
  - **success:** Single-column layout on mobile, two-column from desktop up, rendering the fixed traditional-vs-Deer copy pair.

- **CAP-3** — Minimal footer
  - **intent:** Visitor can find the product name and legal links.
  - **success:** Footer shows product name plus Privacy and Termini links (link targets pending OQ-3).

- **CAP-4** — In-page quiz preview
  - **intent:** Visitor sees a non-interactive sample question card before deciding to start the real quiz.
  - **success:** Preview uses the same quiz-card shape as the real quiz, has no clickable options, and never reveals a mnemonic through interaction.

- **CAP-5** — Single-question presentation
  - **intent:** Visitor answers one official question at a time, with category tag, "Domanda N di 10" progress, and 3-4 full-width answer options.
  - **success:** The next question is never visible before the current one is answered; no login or personal data is required to proceed.

- **CAP-6** — Answer reveal + mnemonic unlock
  - **intent:** On tapping an option, the visitor immediately sees which option was correct and the mnemonic tied to the question.
  - **success:** The correct option is always visually highlighted regardless of the visitor's choice; correctness is never conveyed by color alone; the mnemonic box appears tagged "Mnemotecnica"; advancing to the next question requires an explicit "Conferma" tap — no auto-advance.

- **CAP-7** — No mid-quiz server persistence
  - **intent:** Quiz progress exists only in the visitor's browser, never on the server, until completion.
  - **success:** A refresh mid-quiz returns the visitor to question 1; no database record is created for intermediate answers — only the single completion event (CAP-11).

- **CAP-8** — Result + mnemonic recap
  - **intent:** After question 10, the visitor sees their score and every mnemonic encountered.
  - **success:** Score displayed as "N/10 corrette"; all 10 mnemonics listed regardless of whether each was answered correctly.

- **CAP-9** — Feedback box
  - **intent:** Visitor can leave a quick reaction to the experience.
  - **success:** 5-level star rating, optional, never gates the rest of the final screen; the feedback event is sent independently of whether the email field is filled.

- **CAP-10** — Optional email capture
  - **intent:** Visitor can leave an email for launch updates without it being required to complete the experience.
  - **success:** Field clearly marked optional; only blocking validation is email format; a separate consent checkbox must be checked before an entered email is submitted, but the checkbox never blocks the completion event itself.

- **CAP-11** — Quiz-completed event write
  - **intent:** The system records exactly one completion event per finished quiz.
  - **success:** One Supabase (EU-Frankfurt) record per completion with score, optional feedback, optional email, and a server-stamped timestamp; zero records for abandoned quizzes; score is recomputed server-side from submitted answers, never trusted from the client; the write goes through exactly one Server Action, and the Supabase secret key never reaches the browser.

- **CAP-12** — Cookieless analytics
  - **intent:** The system tracks landing visits, quiz starts, and quiz completions without a cookie consent banner.
  - **success:** `visit_landing`, `quiz_started`, `quiz_completed` fire through one tracking wrapper; `quiz_completed` fires only after the completion Server Action returns success, never optimistically; no consent banner is shown.

## Constraints

- Stack is fixed: Next.js (App Router) + TypeScript + Tailwind CSS v4 on Vercel; Supabase Postgres, EU-Frankfurt; cookieless analytics (Plausible or Umami, pick pending OQ-4). Stripe and a Refine backoffice are explicitly out of scope this slice.
- Server-first Islands: Server Components by default; Client Component islands only around the quiz flow and the feedback form; no `'use client'` at page level.
- Exactly one server write per quiz: no network write between question 1 and the final screen; a single write on completion (score + optional feedback + optional email + timestamp).
- Static quiz content (10 questions + mnemonics) lives as versioned data files in the repo, not in Supabase, this slice — read only through one content-accessor module, never imported raw by a component.
- Score integrity: the completion write is server-side only, through one Server Action; it recomputes the score from submitted answers (never trusts a client-sent score) and stamps the timestamp server-side; the Supabase secret key is read only from server env, never a `NEXT_PUBLIC_`-prefixed var.
- Quiz state (question index, answers, revealed mnemonics) lives in client memory only — no per-question route segment, so a refresh cannot resurrect progress via the URL.
- All analytics calls go through one tracking wrapper against a fixed event list — no component calls the analytics SDK directly.
- Visual design (colors, type, spacing, component shapes) is fully owned by `DESIGN.md`/`EXPERIENCE.md` and wired as a Tailwind theme, not CSS variables — this spec does not restate component visuals.
- One Supabase project (EU-Frankfurt) serves local dev, Vercel Preview, and production this slice — no separate staging database.
- Accessibility: correct/incorrect state is never conveyed by color alone; WCAG 2.1 AA contrast on the DESIGN.md palette.
- Privacy: email and feedback are stored in Supabase EU (Frankfurt) per GDPR; no data is collected without explicit consent.
- Budget ceiling (~5-6k EUR build, ~1.5k EUR/year recurring) drives "as simple as correctly possible": one table, no auth, no second environment, no custom CI/CD.
- All infrastructure accounts (Supabase, Vercel, analytics, domain) must be titled to the Product Owner, not the dev team.

## Non-goals

- No login, user account, or personal area in this slice.
- No full 3000-question database — only 10 placeholder questions, versioned in the repo.
- No timed 100-question simulation, no streak/countdown/weak-area dashboard.
- No admin backoffice (Refine over Supabase is a later phase).
- No payments/Stripe.
- No cross-session or cross-device persistence of quiz progress.
- No mascot (flagged "TBD" in the design system, not decided).

## Success signal

Primary: quiz completion rate (visitors who start question 1 and reach the final screen) reaches ≥50%, and of those completers, ≥20% opt in with an email — both measured via the analytics + Supabase completion events this slice ships (CAP-11, CAP-12). Secondary: average completion time roughly matches the "2 minutes" promise, and feedback-star distribution is read for sentiment, not a target. Guardrail: feedback-star distribution must not degrade while completion rate is optimized — a high completion rate bought by trivializing questions or dropping the mnemonic is a false signal, not a win.

## Assumptions

- GDPR consent copy for the email opt-in checkbox is not yet supplied by any source (Iubenda is the candidate) — a placeholder is needed until OQ-3 resolves; this doesn't block implementation, since the consent-checkbox seam already exists in CAP-10, but it does block real launch.
- No quantitative performance budget (Lighthouse/Core Web Vitals) is set — the Server-Components-by-default approach is judged sufficient for this 4-page slice without a formal target.

## Open Questions

- OQ-1: Who supplies the real content for the 10 questions + mnemonics, and when does it replace the current placeholder data?
- OQ-2: When is the final Deer logo ready? A wordmark-only placeholder is used until then.
- OQ-3: What is the legal copy for the Privacy/Termini pages and the GDPR consent microcopy next to the email field? (Iubenda is the candidate, needs PO confirm/activate.)
- OQ-4: Plausible or Umami for cookieless analytics — final pick, who configures it, who is account owner (must be PO)?
- OQ-5: Is the Supabase project (EU-Frankfurt) already provisioned, and who holds the credentials (must be PO)? Also confirm whether the project issues a legacy `service_role` key or the newer `sb_secret_...` format.
- OQ-6: What domain will be used? Doesn't block development (Vercel preview URLs work without it) but blocks public launch.
