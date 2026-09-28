---
status: final
updated: 2026-08-01
sources:
  - _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md
  - _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/addendum.md
---

# Remindeer — Experience Spine (Landing + Quiz di Assaggio)

> First public slice only: landing page + 10-question no-login taste quiz. Full product (100-question timed simulation, weak-area dashboard, streaks, login) is explicitly out of scope — see Inspiration & Anti-patterns. Paired with `DESIGN.md` (Remindeer visual identity).

## Foundation

Responsive web, mobile-first (Next.js App Router + Tailwind). No native app, no UI system inherited — custom sticker-outline system, `DESIGN.md` is the visual identity reference. Two reference breakpoints: 390px mobile / 1280px desktop (NFR-2). No accounts, no login, no session concept in this slice — every visit is a fresh, anonymous, linear pass through the funnel.

## Information Architecture

**Revised 2026-09-27**: quiz moves off the landing page onto its own route (`/quiz`); the landing no longer embeds a live/static quiz preview. Landing composition becomes hero → comparison → email signup → footer.

| Surface | Reached from | Purpose |
|---|---|---|
| Landing (`/`) | Cold entry — shared link, ad, or social post | Hook, explain the mnemonic differentiator, launch the quiz, capture email even from visitors who don't take the quiz |
| Quiz — Question 1–10 (`/quiz`) | Landing CTA "Prova 10 domande gratis" | One question at a time; answer selects and locks, no reveal until the results screen |
| Results screen | "Avanti" on question 10 | Per-question correct/incorrect breakdown, mnemonics on wrong answers only, feedback, optional email, "Ritenta" |

No navigation menu, no back button semantics beyond the browser default — this is a single-path funnel, not a site with sections to browse. A mid-quiz refresh or tab close returns the visitor to question 1 of `/quiz` with nothing persisted (FR-7); there is no "resume" concept in this slice. "Ritenta" on the results screen restarts the same 10 questions from question 1 within the same visit.

→ Composition reference: `imports/Deer Landing - Hero Quiz Exploration.dc.html` (variants 3a desktop / 3b mobile — the confirmed direction, see addendum.md). Rendered mocks: `mockups/key-landing-mobile.html`, `mockups/key-landing-desktop.html`, `mockups/key-quiz-question.html` (before/after answering), `mockups/key-final-screen.html` (rest state + write-failure retry state). Spine wins on conflict.

## Voice and Tone

Microcopy only. Brand voice and aesthetic posture live in `DESIGN.md.Brand & Style`.

| Do | Don't |
|---|---|
| "Ti aiutiamo a ricordare." | "Ti aiutiamo a studiare." |
| "Prova 10 domande gratis" | "Inizia ora" / "Scopri di più" (generic CTA) |
| "Nessuna registrazione richiesta" | "Registrati per iniziare" framing anywhere pre-quiz |
| "Non studi di più: ricordi meglio." | Vague self-improvement language |
| Direct, concrete, second person | Exclamation-heavy hype, gamified encouragement ("Ottimo lavoro!!") |

The traditional-method-vs-mnemonic contrast (`DESIGN.md.comparison-traditional` / `comparison-remindeer`) is the one rhetorical pattern repeated everywhere copy appears — hero, comparison section, final-screen framing ("il valore è ricordarle, non solo il punteggio").

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

**Revised 2026-09-27** — reveal moves from per-question to the results screen; rows marked accordingly.

| Component | Use | Behavioral rules |
|---|---|---|
| `button-primary` | Hero CTA, sticky-header compact CTA, in-quiz "Avanti", results-screen "Ritenta" | Hero/quiz variant carries `→` arrow; sticky-header compact variant never does. Click on hero CTA jumps straight to question 1 — no intermediate form or confirmation step (FR-1). "Ritenta" restarts the same 10 questions from question 1. |
| `category-tag` | Quiz card | Carries the "Domanda N di 10" progress label. No longer used on a landing preview card (FR-4 retired — landing no longer previews the quiz). |
| `quiz-card` | Real quiz question, "Con Remindeer" comparison column | Same component, two jobs (previously three — the static landing preview job is retired with FR-4). |
| `answer-option` → `answer-option-selected` | Every quiz question | On tap, the tapped option switches to `answer-option-selected` (neutral, primary-tinted) and **locks** — no changing the pick, no correct/incorrect reveal at this point (supersedes the FR-6 "correct option always highlights on tap" behavior, now retired). |
| `answer-option-correct` / `answer-option-incorrect` | Results screen, per-question breakdown row | Repurposed from in-quiz reveal to the aggregate results list: each of the 10 rows shows its own resolved state once the quiz ends. |
| `mnemo-box` | Results screen, incorrect rows only; comparison "Con Remindeer" column | No longer appears during the quiz. On the results screen it appears only next to incorrect answers (correct answers show a checkmark only, no mnemo box). On the comparison section it remains a pre-revealed illustration, ungated. |
| Advance control | Bottom of quiz card, after selection | Explicit "Avanti" tap required to move to the next question — no reveal happens here, it exists purely to give a moment before moving on and to keep advancing deliberate (no auto-advance). |
| Star rating | Results screen feedback box | 5 levels, optional, not a gate to seeing the rest of the screen (FR-9). Independent of the email field — submitting one never requires the other. |
| Email field + consent checkbox | Results screen | Field itself optional, format-validated only (no blocking validation beyond valid email shape). A separate consent checkbox must be checked before an entered email is actually submitted — the checkbox blocks only the email portion, never the completion event itself (FR-10, FR-11). Distinct from the new landing email-signup section (FR-13) — the two never merge. |
| Email field (landing) | Landing, new dedicated section between comparison and footer | FR-13. Independent capture, own consent copy, own analytics event — not the same submission as the results-screen email field. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Mid-quiz refresh / tab close | Quiz (any question) | Returns to question 1. No progress persisted server-side, no resume (FR-7). |
| Answer tapped | Quiz question | Tapped option instantly switches to `answer-option-selected` and locks (no more changing the pick). No reveal, no mnemo box — instant snap-in with no animation, consistent with the flat "a scatto" shadow language (see `DESIGN.md.Elevation`). **Revised 2026-09-27**, supersedes the previous instant-reveal-on-tap behavior. |
| Quiz completed, "Avanti" tapped on question 10 | → Results screen | All 10 answers resolve at once: correct rows show a checkmark, incorrect rows show their `mnemo-box`. **New 2026-09-27.** |
| Quiz-completion write fails (network drop) | Results screen | Result, score, and full per-question breakdown stay visible regardless — they're computed client-side from the session's answers, not dependent on the write. A small inline non-blocking error + retry control appears near the feedback/email area only; nothing on the screen is hidden or blocked by the failure. |
| Email format invalid | Results screen, email field | Inline validation message on the field itself; does not block feedback submission or block viewing the rest of the screen. |
| Email filled, consent checkbox unchecked, user tries to submit | Results screen | Only the email value is withheld from the completion event; feedback (if given) and the completion event itself still go through (FR-9's independence rule extends here). |
| Empty/default | Results screen, star rating | No pre-selected rating; all 5 stars unfilled until tapped. |
| "Ritenta" tapped | Results screen | Same 10 questions restart from question 1, fresh in-memory state; a subsequent completion is a new, independent `quiz_completions` record. **New 2026-09-27.** |

## Interaction Primitives

**Revised 2026-09-27** — reveal-on-tap is retired; selection is now silent and locked.

- Tap/click to select an answer option — single tap selects and **locks** the pick (no changing it), no reveal, no drag, no swipe.
- Explicit tap on "Avanti" to advance — the only way forward through the quiz (no auto-advance, no swipe-to-next, no keyboard shortcut beyond standard Tab/Enter focus activation). Unlike the retired "Conferma", this button never triggers a reveal — it only moves to the next question.
- "Ritenta" on the results screen restarts the same 10 questions from question 1.
- Sticky header: header and its compact CTA remain reachable through the entire landing scroll; CTA click behaves identically to the hero CTA.
- **Banned in this slice** (all appear in the full-product design-system PDF, or were a previous v1 design, and are explicitly out of scope here — see Inspiration & Anti-patterns): countdown/session timer, "Salta" (skip) control, auto-advance, streak/badge display, login gate, cross-session progress resume, **and now also: any per-question correct/incorrect reveal or mnemonic disclosure during the quiz itself** (moved entirely to the results screen).

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md`.

- Correct-answer state is never color-only: the ✓ mark and bold weight (`answer-option-correct`, `DESIGN.md.typography.option-correct`) always accompany the green border/background (NFR-1).
- Text/background contrast meets WCAG 2.1 AA using the `DESIGN.md` palette as specified — verify `text-secondary` (#5F5651) on `surface-muted` (#EAE8E0) specifically, as it's the lowest-contrast pairing in the system (comparison section's traditional-method column).
- All interactive elements (CTA, answer options, "Conferma", star rating, email field, consent checkbox, footer links) reachable and operable by keyboard alone, with a visible focus state consistent with the ink-bordered sticker-outline language (not a default browser outline).
- Star rating exposes its current value and each star's role to assistive tech (not a bare row of unlabeled icons).
- Tap targets sized for comfortable mobile touch — answer options and the CTA are full-width/large by construction (FR-5), consistent with a 44×44px+ minimum.

## Inspiration & Anti-patterns

- **Rejected — Timer / countdown (Farmaconcorso PDF full-product screens):** the v1 taste quiz is explicitly untimed. The JTBD is "let me verify this works for me in 2 minutes with zero commitment" — a visible clock reintroduces exam-style pressure this slice is designed to avoid. Timer belongs to the future 100-question timed simulation only (Non-Goals §6).
- **Rejected — "Salta" (skip) button:** the full-product design system pairs every question with a skip control. This slice's 10 questions are curated placeholders meant to be experienced in full, and skipping would undercut the final-screen mnemonic recap (all 10, not just correct ones, is the point per FR-8).
- **Rejected — Streak / badge / weak-areas dashboard:** all appear in the PDF's post-login screens ("Ciao, Stanis 👋", 7-day streak, aree da rinforzare). None apply — there's no account, no history, no return visit to track in this slice.
- **Kept from the design-system PDF:** palette, sticker-outline visual language, and the `quiz-card`/`answer-option`/`mnemo-box` component shapes — these transfer directly, only the screens built from them differ.
- **Source of truth for landing layout:** the confirmed HTML exploration (`imports/Deer Landing - Hero Quiz Exploration.dc.html`, variant 3, options 3a/3b) — inspired by brumpatenti.it's structure (sticky header with pill CTA, hero with trust-bar numbers, two-column comparison, thin dark footer band). Two other explored directions (badge/social-proof chips; "quiz is the hero") were reviewed and shelved for future A/B testing, not used here — see addendum.md.

## Responsive & Platform

**Revised 2026-09-27** — hero is text-only (no product image/preview card) on both breakpoints; landing gains an email-signup section before the footer.

- Mobile (390px reference): single column throughout. Hero stacks logo → headline → subheadline → CTA → microcopy → trust bar → comparison (single column) → email signup → footer. Header CTA area on mobile can substitute a small category chip for the compact CTA button (nuance from the exploration, not a distinct requirement — layout detail only, see addendum.md).
- Desktop (1280px reference): hero is single-column, centered, text-only (no more two-column copy+preview grid — the live preview card that filled the right column is retired with FR-4); comparison section becomes two side-by-side columns (FR-2); email signup section between comparison and footer; header keeps the compact CTA visible at all times via `position: sticky`.
- The quiz itself (question 1–10) does not have a distinct desktop layout beyond the same `quiz-card` sizing up slightly — it's always a single centered card, never split into columns, on either breakpoint.
- No dark mode in this slice (light-only, see memlog) — no platform/theme branching needed beyond the two width breakpoints.

## Key Flows

### Flow 1 — Marta tries the method before trusting it (mobile, cold link)

1. Marta opens a shared link on her phone — lands on the mobile hero (variant 3b).
2. Reads the headline, subheadline, and the "Perché non è l'ennesimo quiz" comparison section.
3. Taps "Prova 10 domande gratis →".
4. Lands directly on question 1 of 10 (`/quiz`) — no form, no intermediate screen.
5. Taps an answer option. It locks in its selected state — no reveal yet.
6. Taps "Avanti" to advance. Repeats for all 10 questions, with no feedback along the way.
7. **Climax:** the results screen shows her score and, for the first time, resolves every question — checkmarks on what she got right, mnemonics on what she got wrong — she registers that she *remembered* something concrete in about two minutes, with no perceived effort.
8. **Resolution:** she taps a star rating and, convinced, fills in her email, checks the consent box, and submits.

**Edge case:** if Marta closes the tab at question 5, nothing is saved server-side — a later refresh would start her back at question 1 with no memory of the attempt (FR-7).

### Flow 2 — Marta evaluates before committing (desktop, lunch break, more skeptical)

1. Marta arrives from a social post on her work laptop — lands on the desktop hero (text-only, single column as of 2026-09-27).
2. She does not click anything yet. She scrolls through the hero, reads the trust bar, and reaches the comparison section.
3. She reads both columns side by side: the deliberately flat "Metodo tradizionale" column next to the bordered, shadowed "Con Remindeer" column with its mnemonic example.
4. **Climax:** the visual and copy contrast between the two columns convinces her the difference is real, not just a marketing claim ("Non studi di più: ricordi meglio.").
5. Only now does she click "Prova 10 domande gratis" — from the header's compact CTA or the hero CTA, either lands her on question 1.
6. **Resolution:** she enters the quiz already knowing what to expect — no surprise about format, no login prompt interrupting her, no mid-flow request for information she hasn't decided to give yet.

**Failure mode:** if she reaches the quiz-completion Supabase write and it fails (network drop), her score and mnemonic recap remain fully visible — she is not blocked from finishing the experience by a backend hiccup; only a small inline retry note appears near the feedback area.
