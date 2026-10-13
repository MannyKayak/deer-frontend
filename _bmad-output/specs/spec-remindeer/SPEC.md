---
id: SPEC-remindeer
companions:
  - glossary.md
  - supabase-content-contract.md
  - ../../planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/architecture/architecture-remindeer-2026-08-01/SOLUTION-DESIGN.md
  - ../../project-context.md
sources:
  - ../../planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md
  - ../../planning-artifacts/prds/prd-remindeer-2026-08-01/addendum.md
  - ../../planning-artifacts/sprint-change-proposal-2026-09-27.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Remindeer — Landing + Quiz di Assaggio (first public slice)

## Why

**A vision to realize, validated cheaply before committing further.** Remindeer helps newly-graduated pharmacists pass the public exam that assigns pharmacy licenses. The problem is not access to the 3000 official questions — they're public — it's *remembering* them under exam pressure. Remindeer's answer is a mnemonic paired with every question. Before building the full product (3000 questions, personal area, payments), the PO needs a real signal that this method lands with visitors. This slice is that instrument: a public landing page plus a no-login taste quiz on the free questions, letting a visitor *experience* the mnemonic, ending in lightweight feedback + optional email capture. Content is authored in the backoffice (separate repo) and read from the shared Supabase project.

## Capabilities

- **CAP-1** — Hero with CTA to quiz
  - **intent:** Visitor sees a hero (headline, subheadline, CTA, microcopy, trust bar, mascot image) and starts the quiz in one tap/click. Hero copy, stats and image are backoffice-editable under `SPEC-home-hero-content`.
  - **success:** Primary CTA navigates to `/quiz` and lands directly on question 1 (no form, no confirmation). Sticky header keeps a compact CTA reachable through scroll.

- **CAP-2** — Comparison section (traditional method vs Remindeer)
  - **intent:** Visitor reads the mnemonic-vs-rereading contrast before deciding to start the quiz.
  - **success:** Single-column layout on mobile, two-column from desktop up, rendering the fixed traditional-vs-Remindeer copy pair.

- **CAP-3** — Minimal footer
  - **intent:** Visitor can find the product name and legal links.
  - **success:** Footer shows product name plus Privacy and Termini links (targets arrive with the Iubenda step).

- **CAP-4** — *Retired 2026-09-27* (in-page quiz preview; quiz moved to `/quiz`). ID not reused.

- **CAP-5** — Single-question presentation
  - **intent:** Visitor answers one free question at a time, with category tag, "Domanda N di {total}" progress, and full-width answer options.
  - **success:** The next question is never visible before the current one is answered; option count is whatever the question has; `{total}` equals the number of free questions; no login or personal data required.

- **CAP-6** — Answer selection without immediate feedback
  - **intent:** Visitor picks one option per question; the pick locks at once and nothing about correctness is revealed during the quiz.
  - **success:** Tapping an option locks it in a neutral "selected" state, unchangeable; no correct/incorrect signal and no mnemonic appear during the quiz; advancing requires an explicit tap on "Avanti" — no auto-advance.

- **CAP-7** — No mid-quiz server persistence
  - **intent:** Quiz progress exists only in the visitor's browser.
  - **success:** A refresh mid-quiz returns the visitor to question 1; no network call between question 1 and the last answer.

- **CAP-8** — Results + per-question recap
  - **intent:** After the last question, the visitor sees their score and, for every question, whether they got it right — with the mnemonic shown for the ones they missed.
  - **success:** Score shown as "N/{total} corrette"; every question listed — correct → checkmark only, wrong → its mnemonic (text and/or image, tag "🔑 Mnemotecnica"); correctness comes from server-side `check_answer`, never from browser data; "Ritenta" restarts the same questions from question 1 with fresh state and reshuffled options.

- **CAP-9** — Feedback box
  - **intent:** Visitor can leave a quick reaction to the experience.
  - **success:** 5-level star rating, optional, never gates the rest of the final screen; sent as an anonymous analytics event (`quiz_feedback`, rating 1-5), not a database row; independent of the email field.

- **CAP-10** — Optional post-quiz email capture
  - **intent:** Visitor can join the launch mailing list from the results screen without it being required.
  - **success:** Field marked optional; only blocking validation is email format; entered email is submitted only with its consent checkbox checked; stored in the same mailing list as CAP-13; emits `email_signup_quiz`.

- **CAP-11** — *Retired 2026-09-28* (quiz-completion DB write). The landing writes nothing but mailing-list signups; completion is measured by analytics (CAP-12). ID not reused.

- **CAP-12** — Cookieless analytics
  - **intent:** The system tracks landing visits, quiz starts, completions, feedback, and signups without a cookie consent banner.
  - **success:** `visit_landing`, `quiz_started`, `quiz_completed` (score, total), `quiz_feedback`, `email_signup_landing`, `email_signup_quiz` fire through one tracking wrapper on Umami Cloud; `quiz_completed` fires only after grading succeeds; no consent banner shown.

- **CAP-13** — Landing email signup section
  - **intent:** Visitor can join the launch mailing list directly from the landing, without taking the quiz.
  - **success:** Section between comparison and footer; email field + its own explicit consent; no write without consent; emits `email_signup_landing`.

- **CAP-14** — Quiz content from shared Supabase
  - **intent:** The quiz shows every free question, with options, category, and mnemonic, authored in the backoffice and read at runtime as anon.
  - **success:** No question content in repo files; `/quiz` renders exactly the `is_free` questions ordered by `official_number`; `is_correct` never reaches the browser; options matched by id and shown in shuffled order.

- **CAP-15** — Optional question and mnemonic images
  - **intent:** Visitor sees the image attached to a question or mnemonic when one exists, and a clean layout when none does.
  - **success:** Images load via 1-hour signed URLs from the private `question-images` bucket, never public URLs; missing image renders no broken image or empty frame; a mnemonic with only text or only image renders correctly.

## Constraints

- Stack: Next.js (App Router) + TypeScript + Tailwind CSS v4 on Vercel; Supabase Postgres in the EU; Umami Cloud analytics. Stripe and backoffice features stay out of this repo.
- The backoffice repo owns the whole Supabase schema (ADR-004), landing tables included. This repo never creates or pushes migrations; `supabase/migrations/` is history only. Schema changes enter only by regenerating types with `supabase gen types typescript --linked`; generated types are never hand-edited.
- Landing permissions: reads (incl. `check_answer`) and mailing-list insert only, all as anon with the publishable key. No secret key in the landing. Supersedes AD-2 (one completion write) and AD-5 (secret-key write).
- What anon can read is fixed by RLS (matrix in `supabase-content-contract.md`); every select lists columns — `select *` fails.
- Correctness is knowable only through `check_answer`, called server-side at the end of the quiz; `P0002`/`22023` count as wrong, never crash the flow.
- Data funnel (ADR-003): all Supabase access goes through named functions in `lib/data/`; lint fails on `supabase.from`/`rpc`/`storage`/`auth` elsewhere. Supersedes AD-3/AD-6 (content in repo via `lib/content`).
- Options identified by uuid, never by `position`; question ids are uuids.
- Question count is dynamic everywhere (progress, score, copy) — never hardcoded.
- Server-first Islands: Server Components by default; Client Component islands only around the quiz flow and the feedback/email forms; no `'use client'` at page level.
- Quiz state lives in client memory only — no per-question route segment.
- All analytics calls go through one tracking wrapper against a fixed event list.
- Visual design is owned by `DESIGN.md`/`EXPERIENCE.md`, wired as a Tailwind theme.
- One Supabase project serves local dev, Vercel Preview, production, and the backoffice.
- Accessibility: correct/incorrect never conveyed by color alone; WCAG 2.1 AA contrast.
- Privacy: no email stored without explicit consent; data stays in the EU.
- Budget ceiling (~5-6k EUR build, ~1.5k EUR/year) drives "as simple as correctly possible".
- All infrastructure accounts (Supabase, Vercel, Umami, domain `remindeer.it`) titled to the PO.

## Non-goals

- No login, user account, or personal area — every call is anon in phase 1.
- No premium (non-free) questions or paywall.
- No database writes beyond mailing-list signups (no score/feedback storage).
- No content editing or schema management from this repo.
- No legal pages or final consent copy in this step — next step, with Iubenda.
- No timed 100-question simulation, no streak/countdown/weak-area dashboard.
- No payments/Stripe.
- No cross-session or cross-device persistence of quiz progress.
- No in-page quiz preview on the landing.

## Success signal

Primary: quiz completion rate (visitors who start question 1 and reach results) ≥50%, and of those completers ≥20% join the mailing list — measured via Umami events (CAP-12). Secondary: average completion time roughly matches the "2 minutes" promise; feedback-star distribution read for sentiment, not a target. Guardrail: feedback-star distribution must not degrade while completion rate is optimized. Readiness check: `/quiz` plays end-to-end on the free questions from Supabase, grades via `check_answer`, with no repo question data and no `is_correct` in any browser payload (verified 2026-09-28 on question 953, both correct and wrong paths).

## Assumptions

- Placeholder consent copy is used for both email fields until the Iubenda step.
- No quantitative performance budget (Lighthouse/Core Web Vitals) is set.
- Option order is shuffled on the server per request and reshuffled client-side on "Ritenta".
- Signed-URL TTL is 1 hour, generated per `/quiz` request.
- CTA copy reads "Prova il quiz gratis" (count-free) since the question count is dynamic.

## Open Questions

- OQ-2: Final logo — the PO will send it when ready; wordmark placeholder until then.
- OQ-5: Is the shared Supabase project titled to the PO?
- OQ-11 (backoffice): `email_signups` needs a `source` column (landing|quiz), consent proof (`consent_given_at`, `consent_text_version`), a unique lowercase email, and an anon insert-only RLS policy. Until then the landing stores email only — no consent proof, duplicates possible, and inserts fail if the policy is missing.
- OQ-12: The project runs in West EU (Paris), not Frankfurt as originally specced. Accept Paris (still EU) or migrate?
