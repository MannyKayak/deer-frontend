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

**A vision to realize, under a decided product rule.** The platform helps candidates for the pharmacy-license exam memorize the 3000 official questions; its differentiator is the mnemonic attached to each question (plain text or a "scene to imagine", tone may be ironic or bold). Decision G8: the mnemonic is shown **only in review, after the attempt is submitted — never during the simulation**. The simulation measures active recall; a mnemonic or right/wrong feedback mid-test would falsify that measure and the comparison between 1st and 2nd attempt on the same test. Review of errors is therefore where the mnemonic is delivered, and it must lead the candidate into the 2nd attempt — the key product lever.

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
  - **success:** CTA "Rivedi i N errori", N computed from the attempt, opens the review.

- **CAP-5** — Per-question review content
  - **intent:** For each reviewed question the candidate sees what they answered, what was correct, and the mnemonic.
  - **success:** Each question renders the elements listed in `review-screen.md`, in that order; given answer marked wrong, correct answer marked correct, ministerial-correction indicator when applicable.

- **CAP-6** — Mnemonic always visible in review
  - **intent:** The published mnemonic is displayed without any extra interaction.
  - **success:** After submission, every wrong question with a published mnemonic shows it with zero additional taps.

- **CAP-7** — Question without mnemonic
  - **intent:** A reviewed question lacking a published mnemonic renders cleanly.
  - **success:** No empty or broken box; at most one discreet line such as "Mnemotecnica in arrivo".

- **CAP-8** — Review navigation
  - **intent:** The candidate moves through errors one at a time and knows where they are.
  - **success:** Previous/next controls, indicator "Errore 3 di 24", arrow keys on desktop.

- **CAP-9** — Resume
  - **intent:** Leaving and re-entering, or refreshing, resumes the review at the last error seen.
  - **success:** A refresh mid-review reopens the same error.

- **CAP-10** — End of review
  - **intent:** The review closes by steering the candidate to the 2nd attempt.
  - **success:** After the last error a summary is shown with CTA "Ripeti la stessa prova", which starts a new attempt on the same test.

- **CAP-11** — MnemoCard
  - **intent:** One card renders a mnemonic in two visual variants, `testo` and `scena da immaginare`.
  - **success:** Scene variant carries a label such as "Immagina:" and a slightly different visual tone; bold/ironic copy does not read as a tone error against the rest of the UI; layout holds at 360px with 5–6-line mnemonics and long options.

- **CAP-12** — Helpful / not-helpful vote
  - **intent:** The candidate rates a mnemonic with one tap — "Mi aiuta" / "Non mi aiuta" — and can change their mind.
  - **success:** One vote per user (or anonymous id) per mnemonic; a new tap changes the vote; a double tap or a queue replay leaves exactly one vote recorded.

- **CAP-13** — Offline-tolerant vote
  - **intent:** The vote is saved optimistically and synced later, as answers are.
  - **success:** The UI reflects the vote immediately; a vote cast offline reaches the server when the connection returns.

- **CAP-14** — Anonymous free-tier parity
  - **intent:** Anonymous free users (100 free questions) get review, mnemonics, and feedback exactly as premium users do.
  - **success:** Review, mnemonics, and voting work end to end with no login.

- **CAP-15** — Non-invasive paywall card
  - **intent:** Free users are shown the value of the remaining catalogue without being blocked.
  - **success:** Card "Altre N domande, tutte con la loro mnemotecnica" appears at end of review or after a configurable number of errors seen; N is computed; the card never interrupts the review in progress and never hides content already shown.

- **CAP-16** — Feedback feeds the backoffice
  - **intent:** Votes are available to backoffice BO-M3.
  - **success:** Per-mnemonic helpful / not-helpful counts are queryable, with a "most negatively voted" filter.

## Constraints

- Withholding is enforced by the server, never by the UI: mnemonic and correct answer must be absent from browser dev tools for an unsubmitted attempt. Rules out shipping them with the simulation payload and grading on the client.
- Only state `pubblicata` is ever served; at most one published mnemonic per question.
- The vote write is idempotent, keyed by mnemonic + user-or-anonymous id (fields in `disclosure-and-data-contract.md`).
- Votes use the same optimistic-save + sync-queue mechanism as answers; must work offline and for anonymous users.
- Review position is local-only state — no server persistence.
- Paywall N is computed, never hand-written; the errors-seen threshold is configurable.
- Visual system: sticker outline, marked border, flat hard shadow (no blur), gold accent identifies the mnemonic, Fredoka titles, Inter body (tokens in `review-screen.md`).
- Accessibility: legible at 360px, WCAG AA contrast, no information conveyed by color alone.
- Stack is decided (`project-context.md`): Next.js + TypeScript + Tailwind on Vercel, Supabase. Choices inside that stack (OQ-6 … OQ-8) remain open.
- Built in this repo, alongside the landing — not a separate project.
- Content is authored in the backoffice; the frontend shows whatever arrives and assumes no mnemonic coverage level — review must hold from zero to full coverage.

## Non-goals

- No mnemonic images.
- No community-proposed alternative mnemonics.
- No feedback-driven smart review.
- No gamification.

## Success signal

During a simulation the Network tab shows no mnemonic and no correct answer; once the attempt is submitted, every wrong question with a published mnemonic shows it with no extra tap, an anonymous user can vote on it offline, and that vote arrives exactly once when the connection returns.

## Assumptions

- An attempt has an explicit submitted state that gates disclosure; an attempt that times out counts as submitted.
- Feedback buttons are not rendered for a question with no published mnemonic.
- Design tokens follow the adopted `DESIGN.md` (Fredoka titles); `project-context.md` still says Lexend and is stale on that point.
- This spec sits beyond the landing slice (`spec-remindeer`); that slice's non-goals (no login, no paywall, no timed simulation, no DB writes) do not bind this feature.

## Open Questions

Reserved to the PO by the brief — not decided here:

- OQ-1: Does the review include **unanswered** questions, or only wrong ones? Proposal on the table: wrong + unanswered, with a filter. Affects the N in CAP-4, CAP-5 (no given answer to show), and the CAP-8 indicator wording.
- OQ-2: Is there also an "all questions" review that shows mnemonics for correct answers too?
- OQ-3: In **flashcard mode**, does the mnemonic stay "one tap after the answer reveal" per roadmap FE-M1-E3-T03? G8 covers the simulation only — confirm.

Source conflicts:

- OQ-5: The brief names the product **Farmaconcorso**; the glossary and UX record have the PO confirming **Remindeer**. Which name ships?

Stack-dependent:

- OQ-6: How is server-side withholding implemented — dedicated simulation/review endpoints, row/column-level database policies, or server-rendered payloads?
- OQ-7: Where do the offline queue and the local review position live (localStorage, IndexedDB, service worker / background sync)? The brief says "as for answers", but no answer queue exists yet.
- OQ-8: How is `id_anonimo` generated and kept stable, and are anonymous votes merged into the account when the user later registers or buys?

Data and product gaps:

- OQ-9: Mnemonic lifecycle storage — a status column on one row per mnemonic, or a versions table? The deployed schema has `mnemonics` 1:1 with question, with no status and no type.
- OQ-10: When a published mnemonic is replaced, do its votes stay with the old version (counts restart) or carry over?
- OQ-11: Source of the paywall N — catalogue minus free set, or only questions that actually have a published mnemonic? "Tutte con la loro mnemotecnica" is false if some lack one.
- OQ-12: What does the ministerial-correction indicator show (badge only, or what changed), and where is that data stored?
- OQ-13: Can a vote be withdrawn, or only switched between the two values?
- OQ-14: A stable anonymous id plus voting behaviour may be personal data — is a privacy notice or consent needed?
- OQ-15: Where does the errors-seen paywall card sit so that it "never interrupts" — inline between errors, or a non-blocking banner?
