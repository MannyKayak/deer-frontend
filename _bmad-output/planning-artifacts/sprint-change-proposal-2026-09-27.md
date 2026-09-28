---
title: Sprint Change Proposal — Landing/Quiz UX Refinement
date: 2026-09-27
status: approved
trigger: PO change request (post-slice-1 refinement), not a story defect
---

# Sprint Change Proposal — 2026-09-27

## 1. Issue Summary

Epic 1, 2, 3 are all marked `done` in `sprint-status.yaml` (generated 2026-08-01). The PO has now requested a set of changes that go beyond visual polish and alter the shipped UX contract:

1. Hero without a product image (text-only, matches `Design System Farmaconc v2.pdf` p.2 example).
2. `button-primary` token change: background `#24C5AB` (existing `{colors.primary}` token, not the currently-used `{colors.primary-dark}`), radius 20px (`{rounded.md}`, not `{rounded.full}` pill), + new 2px solid ink border.
3. Headline/CTA/text font reverts from Lexend to **Fredoka** (question text excluded).
4. Quiz moves off the landing page entirely, onto its own route (`/quiz`).
5. Quiz interaction model inverts: no per-question feedback, answer locked immediately on tap (not just on "Conferma"); correctness + mnemonics shown only in aggregate at the results screen; wrong answers show mnemonic, correct answers show only a checkmark; "Ritenta" CTA restarts the same 10 questions.
6. New "leave your email" section added directly to the landing page (hero + comparison + email + footer), kept **distinct** from the existing post-quiz optional email capture (Story 3.2) — both persist.

This is a genuine requirement change (category: new requirement emerged from stakeholder / UX pivot), not a bug. It directly contradicts acceptance criteria already implemented in Stories 1.1, 1.4, 2.2, 2.3, and touches the landing composition around Story 3.2.

## 2. Epic & Artifact Impact

### Epic 1 — Landing Page & Foundation
- **Story 1.1 (Hero with CTA)** — REVISE. Hero loses its image/live-preview visual; desktop two-column layout (UX-DR14, copy left / preview quiz-card right) collapses to single-column text hero on both breakpoints. `button-primary` token changes (see Design System below). Headline/CTA font becomes Fredoka.
- **Story 1.4 (In-Page Quiz Preview)** — RETIRE. FR-4 is removed entirely; the static preview card no longer has a home once the quiz is off the landing page. `getPreviewQuestion()` accessor becomes dead code.
- **New Story 1.5 (Landing Email Signup Section)** — ADD. New FR-13: a standalone email capture section on the landing page (hero → comparison → email → footer), independent of the post-quiz email capture (Story 3.2). Needs its own consent copy + its own analytics event (`email_signup_landing`, distinct from whatever event Story 3.2/3.3 already uses) and, most likely, its own lightweight Server Action or a shared one parameterized by source — flagged for dev to decide at implementation time.

### Epic 2 — Quiz di Assaggio
- **Story 2.1 (Quiz Flow Start)** — REVISE (light). Quiz still a Client Component island with in-memory state (AD-7 unaffected — still no per-question route segment), but it now renders at `app/quiz/page.tsx` instead of embedded in the landing. `quiz_started` event fires on that route instead.
- **Story 2.2 (Answer Reveal, Mnemonic Unlock & Advance)** — REVISE substantially. Current AC: tap selects (changeable) → "Conferma" reveals correct/incorrect + mnemo box → "Continua" advances. New AC: tap selects **and immediately locks** (no changing the pick, no reveal, no mnemo box) → advance to next question with no confirmation step gating on a reveal. This removes the entire reveal/mnemo-box-during-quiz behavior from this story — it moves to Story 2.3.
- **Story 2.3 (Results Screen)** — REVISE substantially. New AC: per-question breakdown showing correct/incorrect for all 10; correct → checkmark only; incorrect → mnemonic box (🔑 Mnemotecnica) shown; "Ritenta" `button-primary` CTA restarts the same 10 questions from question 1 (same in-memory session, fresh state).

### Epic 3 — Feedback, Email Capture & Completion Event
- **Story 3.1 (Feedback Box)** — NO AC change, repositioning only (now sits inside the redesigned results screen from 2.3-REV).
- **Story 3.2 (Optional Email Capture with Consent)** — NO AC change. Explicitly confirmed to remain distinct from the new landing email section (1.5).
- **Story 3.3 (Quiz Completion Write)** — NO AC change, one clarification: "Ritenta" produces a fresh quiz attempt: if the visitor completes it again, that's a second, independent `quiz_completions` record. This is consistent with existing FR-11 (record per completion) and needs no code change, just explicit confirmation for the dev.

### PRD (`prd.md`)
- FR-4 → marked retired.
- FR-6 → rewritten (no immediate reveal, immediate lock on tap).
- FR-8 → rewritten (aggregate correct/incorrect list, mnemonics only on wrong, retry).
- New FR-13 → landing email signup section.
- MVP scope (§7.1) updated: quiz is no longer "in landing", it's its own screen; landing scope becomes hero + comparison + email + footer.
- No reduction in MVP ambition — this is a re-shape, not a scope cut.

### Architecture
- Minor: `app/quiz/page.tsx` route needed (Structural Seed already anticipates `app/` + `components/quiz/`, this is additive, not a new pattern). No Architect involvement needed.
- AD-7 (no per-question route segment) still holds — only the container page moves, not the internal quiz state model.

### UX Design (`DESIGN.md`)
- **`button-primary`**: `background` changes from `{colors.primary-dark}` → `{colors.primary}` (`#24C5AB`); `radius` changes from `{rounded.full}` → `{rounded.md}` (20px); add `borderWidth: 2px`, `borderColor: {colors.text-primary}` (currently borderless). This actually makes the button *more* consistent with the sticker-outline ink-border language used everywhere else (quiz-card, chip, category-tag already have ink borders) — not a regression, closes a prior inconsistency.
- **Typography**: `headline-hero(-mobile)`, `headline-section(-mobile)`, `cta`, `cta-compact`, `stat-number(-mobile)`, `wordmark` → fontFamily changes `Lexend` → `Fredoka`.
- ⚠️ **Discrepancy found, needs your call**: `typography.question` is currently set to `Lexend` in `DESIGN.md`, but both `project-context.md` and the source PDF say question text should be **Inter** ("Inter — testo lungo, domande, opzioni di risposta"). Your instruction was "Fredoka per titoli e testi, non per le domande" — read literally that just excludes questions from the Fredoka swap, it doesn't say what font questions *should* be. Given the source-of-truth conflict, recommend also correcting `typography.question` to `Inter` while we're touching typography — confirm or reject.
- **Hero layout** (UX-DR14): desktop two-column (copy + live preview) collapses to single-column centered text hero on both breakpoints (no more "preview" half to show).
- **Quiz interaction (UX-DR15)**: "tap/click only to select" stays, but drop "may tap a different option to change pick before confirming" and "explicit tap on Conferma to advance" — replaced by: tap = select + lock + auto-advance (no separate confirm step) or select + then a neutral "Avanti" advance (no reveal) — **needs your call**: does tapping an option auto-advance immediately, or does the visitor still tap a neutral "Avanti/Continua" button (just without any reveal happening first)? This affects the component spec.
- **`answer-option-correct` / `answer-option-incorrect`** components: no longer used *during* the quiz; repurposed for the new per-question results-list rows in Story 2.3.
- **New component needed**: a compact "results-row" (category tag + question text truncated + ✓/mnemo-box, per row) for the 2.3 breakdown — not yet in DESIGN.md, to be added when the story is drafted.
- **UX-DR17 banned patterns**: add "immediate per-question reveal" to the banned-pattern list (was previously the intended behavior, now explicitly reversed).

## 3. Recommended Path Forward

**Option 1 — Direct Adjustment**, hybrid with one retirement (Story 1.4). No rollback of shipped code needed beyond removing the now-orphaned preview component/accessor; no PRD MVP reduction.

- Effort: **Medium** (one story retired, one new story, three stories substantially rewritten, one design-token/typography update, one new component spec).
- Risk: **Medium** — the quiz state machine changes shape (lock-on-tap vs lock-on-confirm; reveal moves from per-question to aggregate), so 2.2/2.3 need a full re-implementation, not a patch. Score integrity (server-recomputed, FR-11) is unaffected since it never depended on when reveal happens.
- Rejected: Option 2 (rollback) — nothing here is a failed approach, it's a direction change; reverting working code buys nothing. Option 3 (MVP review) — not needed, scope isn't shrinking or the goals changing, just the interaction/IA shape.

## 4. Open Decisions — RESOLVED 2026-09-27

1. **Typography.question**: ✅ fixed — `Lexend` → `Inter`, aligned with `project-context.md`/PDF.
2. **Advance mechanic**: ✅ tap selects and locks; a separate "Avanti" `button-primary` (no reveal) is required to move forward.

## 5. Implementation Handoff

**Scope classification: Moderate** — backlog reorganization (retire 1 story, add 1 story, rewrite 3 stories) + design-token update, executed directly by the Developer agent once approved; no PM/Architect replan needed.

- `bmad-create-story` → regenerate story files for: 1.1 (hero), 1.4 (retire — replace file content with retirement note, or delete + remove from sprint-status), 1.5 (new email section), 2.2, 2.3.
- `bmad-dev-story` (or `bmad-quick-dev` for the lower-risk ones: 1.1 visual-only changes) to implement.
- `sprint-status.yaml` update (pending your approval, see below): `1-4-in-page-quiz-preview` → new status/handling for retirement; add `1-5-landing-email-signup-section: backlog`; `1-1-hero-with-cta`, `2-2-answer-reveal-mnemonic-unlock-advance`, `2-3-results-screen` → reset to `backlog` (or `ready-for-dev` once story files are regenerated).

---

**Approvato 2026-09-27.** `DESIGN.md`, `EXPERIENCE.md`, `epics.md`, `prd.md` e `sprint-status.yaml` aggiornati di conseguenza.
