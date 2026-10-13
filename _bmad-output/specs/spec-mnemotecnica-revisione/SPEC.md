---
id: SPEC-mnemotecnica-revisione
companions:
  - review-screen.md
  - disclosure-and-data-contract.md
  - ../../project-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Mnemonic in Review (G8)

## Why

**A vision to realize, under a decided product rule.** Remindeer helps candidates for the pharmacy-license exam memorize the 3000 official questions; its differentiator is the mnemonic attached to each question (plain text or a "scene to imagine", tone may be ironic or bold). Decision G8: the mnemonic is shown **only in review, after the attempt is submitted — never during the simulation**. The simulation measures active recall; a mnemonic or right/wrong feedback mid-test would falsify that measure and the comparison between 1st and 2nd attempt on the same test. Review of errors is therefore where the mnemonic is delivered, and it must lead the candidate into the 2nd attempt — the key product lever.

## Capabilities

- **CAP-1** — Simulation shows no mnemonic and no correctness
  - **intent:** During an in-progress simulation the candidate sees only question, options, timer, and progress.
  - **success:** No mnemonic and no correct/incorrect signal appears anywhere in the simulation UI.

- **CAP-2** — Server-side withholding
  - **intent:** The server never discloses the mnemonic or the correct answer for questions of an attempt not yet submitted.
  - **success:** For an in-progress attempt, no API response contains mnemonic content or the correct answer — verified in the browser Network tab.

- **CAP-3** — Published-only mnemonic
  - **intent:** Review exposes only the mnemonic in state `pubblicata`, at most one per question.
  - **success:** Mnemonics in draft, in-review, or archived state never appear in any review response or screen.

- **CAP-4** — Review entry
  - **intent:** From the result screen the candidate opens the review of their errors.
  - **success:** CTA "Rivedi i N errori", N computed from the attempt as wrong + unanswered questions, opens the review.

- **CAP-5** — Per-question review content
  - **intent:** For each reviewed question the candidate sees what they answered, what was correct, and the mnemonic.
  - **success:** Each question renders the elements listed in `review-screen.md`, in that order; given answer marked wrong, correct answer marked correct.

- **CAP-6** — Mnemonic always visible in review
  - **intent:** The published mnemonic is displayed without any extra interaction.
  - **success:** After submission, every wrong question with a published mnemonic shows it with zero additional taps.

- **CAP-7** — Question without mnemonic
  - **intent:** A reviewed question lacking a published mnemonic renders cleanly.
  - **success:** No empty or broken box; at most one discreet line such as "Mnemotecnica in arrivo"; no feedback buttons.

- **CAP-8** — Review navigation
  - **intent:** The candidate moves through errors one at a time and knows where they are.
  - **success:** Previous/next controls, indicator "Errore 3 di 24", arrow keys on desktop.

- **CAP-9** — Resume
  - **intent:** Leaving and re-entering, or refreshing, resumes the review at the last error seen.
  - **success:** A refresh mid-review reopens the same error.

- **CAP-10** — End of review
  - **intent:** The review closes by steering the candidate to the 2nd attempt.
  - **success:** After the last error a summary is shown with CTA "Ripeti la stessa prova", which starts a new attempt on the same questions with both question order and option order reshuffled.

- **CAP-11** — MnemoCard
  - **intent:** One card renders a mnemonic in two visual variants, `testo` and `scena da immaginare`.
  - **success:** Scene variant carries a label such as "Immagina:" and a slightly different visual tone; bold/ironic copy does not read as a tone error against the rest of the UI; layout holds at 360px with 5–6-line mnemonics and long options.

- **CAP-12** — Helpful / not-helpful vote
  - **intent:** The candidate rates a mnemonic with one tap — "Mi aiuta" / "Non mi aiuta" — and can change their mind.
  - **success:** One vote per user (or anonymous id) per mnemonic; tapping the other button changes the vote; tapping the lit button withdraws it (neither button lit, no vote counted); a queue replay never leaves more than one vote recorded.

- **CAP-13** — Offline-tolerant vote
  - **intent:** The vote is saved optimistically and synced later, as answers are.
  - **success:** The UI reflects the vote immediately; a vote cast offline reaches the server when the connection returns.

- **CAP-14** — Anonymous free-tier parity
  - **intent:** Anonymous free users get review, mnemonics, and feedback exactly as premium users do.
  - **success:** Review, mnemonics, and voting work end to end with no login.

- **CAP-15** — *Parked 2026-10-14* (non-invasive paywall card). Reopens when payments (Stripe) are implemented. ID not reused.

- **CAP-16** — Feedback feeds the backoffice
  - **intent:** Votes are available to backoffice BO-M3.
  - **success:** Per-mnemonic helpful / not-helpful counts are queryable, with a "most negatively voted" filter.

- **CAP-17** — Wrong and unanswered together, with a filter
  - **intent:** The review covers both wrong and unanswered questions, and the candidate can narrow it to one kind.
  - **success:** A prova with 20 wrong and 10 unanswered yields a 30-question review; a filter shows only wrong or only unanswered; an unanswered question shows "Non hai risposto" in place of the given answer, with no wrong mark.

- **CAP-18** — "Mostra tutte le mnemotecniche" switch
  - **intent:** The candidate can widen the review from their errors to every question of the attempt, correct ones included.
  - **success:** Switch is off by default (errors only = wrong + unanswered); turned on, the review covers all questions of the attempt, each with its published mnemonic; turned off, it returns to errors only.

- **CAP-19** — Anonymous votes follow the user
  - **intent:** Votes cast anonymously move to the user's account when they register or buy.
  - **success:** A user who voted on 15 mnemonics anonymously and then creates an account finds those 15 votes already set; no vote is duplicated or lost in the backoffice counts.

## Constraints

- Withholding is enforced by the server, never by the UI: mnemonic and correct answer must be absent from browser dev tools for an unsubmitted attempt. Rules out shipping them with the simulation payload and grading on the client.
- An attempt that runs out of time counts as submitted and opens to review.
- Only state `pubblicata` is ever served; at most one published mnemonic per question.
- The vote write is idempotent, keyed by mnemonic + user-or-anonymous id (fields in `disclosure-and-data-contract.md`).
- A vote belongs to one mnemonic version: a rewritten mnemonic starts from zero votes; old votes stay with the old version.
- Votes use the same optimistic-save + sync-queue mechanism as answers; must work offline and for anonymous users.
- Review position is local-only state — no server persistence.
- Content is authored in the backoffice, which also sets which questions are free; the frontend receives only content the user may access and shows whatever arrives. It assumes no mnemonic coverage level — review must hold from zero to full coverage.
- Visual system: sticker outline, marked border, flat hard shadow (no blur), gold accent identifies the mnemonic, Fredoka titles, Inter body (tokens in `review-screen.md`).
- Accessibility: legible at 360px, WCAG AA contrast, no information conveyed by color alone.
- Stack is decided (`project-context.md`): Next.js + TypeScript + Tailwind on Vercel, Supabase. Choices inside that stack (OQ-6 … OQ-8) remain open.
- Built in this repo, alongside the landing — not a separate project.

## Non-goals

- No paywall card or paywall CTA until payments (Stripe) are implemented; when it returns, its copy comes from the backoffice.
- No ministerial-correction indicator — no feature for it is in development.
- No mnemonic images.
- No community-proposed alternative mnemonics.
- No feedback-driven smart review.
- No gamification.
- No change to flashcard mode: G8 covers the simulation only; in flashcards the mnemonic stays one tap after the answer reveal (roadmap FE-M1-E3-T03).

## Success signal

During a simulation the Network tab shows no mnemonic and no correct answer; once the attempt is submitted, every wrong question with a published mnemonic shows it with no extra tap, an anonymous user can vote on it offline, and that vote arrives exactly once when the connection returns.

## Assumptions

- Design tokens follow the adopted `DESIGN.md` (Fredoka titles); `project-context.md` still says Lexend and is stale on that point.
- This spec sits beyond the landing slice (`spec-remindeer`); that slice's non-goals (no login, no timed simulation, no DB writes) do not bind this feature.

## Open Questions

Stack-dependent:

- OQ-6: How is server-side withholding implemented — dedicated simulation/review endpoints, row/column-level database policies, or server-rendered payloads?
- OQ-7: Where do the offline queue and the local review position live (localStorage, IndexedDB, service worker / background sync)? The brief says "as for answers", but no answer queue exists yet.
- OQ-8: How is `id_anonimo` generated and kept stable, and by what mechanism are anonymous votes attached to the account at registration (CAP-19)?

For the backoffice:

- OQ-9: Mnemonic lifecycle storage — a status column on one row per mnemonic, or a versions table? The deployed schema has `mnemonics` 1:1 with question, with no status and no type. Each version needs its own id for votes to restart from zero.

Privacy:

- OQ-14: A stable anonymous id plus voting behaviour may be personal data — is a privacy notice or consent needed?
