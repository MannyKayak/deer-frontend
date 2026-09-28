# Deferred Work

## Deferred from: code review of 1-1-hero-with-cta (2026-09-27)

- Orphaned `font-lexend` usages in `comparison-section.tsx`, `comparison-remindeer.tsx`, `comparison-traditional.tsx`, `email-capture.tsx`, `results-screen.tsx`, `quiz-flow.tsx` contradict DESIGN.md 2026-09-27 typography (headlines → Fredoka, questions → Inter). Lexend is still loaded in `app/layout.tsx`, so 3 font families download. The `app/globals.css` comment claims Inter for questions, which is not true yet.
- `ButtonPrimary` has no `disabled:` styling. The results-screen submit (`disabled={isPending}`) looks active and hover-lifts, so users may tap twice. _(Resolved in the 1.5 code review, 2026-09-27.)_
- Header may overflow or wrap the CTA label below the 390px reference breakpoint (longer "Remindeer" wordmark + compact CTA, no gap between groups).
- ~~`#quiz` anchor target lacks `scroll-margin-top`~~ _(Obsolete 2026-09-28: quiz moved to `/quiz`, no anchor.)_
- `ButtonPrimary` hover translate ignores `prefers-reduced-motion` (no `motion-reduce:` variants).
- Planning doc drift: DESIGN.md prose (~line 270) still reserves `rounded.full` for the CTA, which conflicts with the frontmatter `rounded.md`. epics.md (~line 160) still says tokens go under `theme.extend` instead of `@theme`.

## Deferred from: code review of 1-5-landing-email-signup-section (2026-09-27)

- Public Server Actions (`submitEmailSignup`, `gradeQuiz`) have no rate limit, honeypot or captcha. Bots can flood `email_signups` or hammer `check_answer`. Needs an architecture-level decision. _(Updated 2026-09-28: `submitQuizCompletion` removed.)_
- Consent copy in `EmailCapture` is still placeholder pending OQ-3 legal text, and it is now used on 2 capture paths. Block release until it is final.
- Consent reaches the action via a hidden input mirrored from React state, and the checkbox itself has no `name`. Submits before hydration (the landing is prerendered) always fail the consent check. Fix: `name="consent" value="true"` on the checkbox and drop the hidden inputs in both `email-signup-form.tsx` and `results-screen.tsx`.
- A11y of the email forms: the success `role=status` mounts already filled (it may not be announced, and focus is lost when the submit button unmounts). The server error `role=alert` isn't linked to the input via `aria-describedby`/`aria-invalid`. Same pattern in results-screen.
- Tailwind v4 focus-ring bug (`outline-none` + `focus-visible:outline*` computes to no outline) is still in `components/ui/answer-option.tsx` and `components/ui/star-rating.tsx`. Fix with the same `outline-hidden` + `focus-visible:outline-solid` swap used in 1.5.
- Landing form copy: `EmailCapture` hardcodes "(facoltativa)", but the landing action rejects an empty email. The consent text is also shared with the results screen, while FR-13 asks for "own consent copy". Fix with optional `emailHint`/`consentLabel` props on `EmailCapture`. Reason for deferring: waiting on the OQ-3 copy decision.
- **HIGH, blocks launch:** there is no way to withdraw consent (GDPR art. 7(3)), even though the consent copy promises "Puoi ritirare il consenso in qualsiasi momento". Needs an unsubscribe path (a link in the emails, or a request form) plus deletion or `consent_withdrawn_at` on `email_signups` (backoffice-owned, spec OQ-11). _(Updated 2026-09-28: `quiz_completions.email` no longer written.)_

## Deferred from: Supabase content adaptation (2026-09-28)

- **Blocks launch (GDPR):** deployed `email_signups` stores no consent proof (`consent_given_at`, `consent_text_version`), no `source`, no unique email — backoffice must add them plus an anon insert-only policy (spec OQ-11). Landing insert not exercised against live DB.
- `gradeQuiz` fires one `check_answer` RPC per question in parallel; grading took ~3-5s on the first live run. Fine for today's single free question; with many free questions consider a batch RPC in the backoffice.
- Stale inline code comments in `components/ui/button-primary.tsx` ("Conferma"/"Continua") and `components/landing/email-signup-form.tsx` (Story 1.5 wording) — cosmetic.

## Deferred from: code review of 2-1, 2-2, 2-3, 3-1, 3-2 (2026-09-28)

- **Blocks launch:** quiz feedback (`quiz_feedback`) and completion (`quiz_completed`) now only go through `track()`, which is a no-op in production until Umami is wired — all such data is silently dropped until then.
- Signed image URLs expire after 1h (CAP-15) and "Ritenta" reuses them; `ContentImage` has no `onError` fallback, so long sessions show broken images.
- Question/mnemonic images use generic alt text ("Immagine della domanda") — the schema has no alt field; needs backoffice support if images carry answer-relevant content.
- A free question with zero `question_options` softlocks the quiz (no option → no "Avanti"). Backoffice data-integrity concern.
- ESLint ADR-003 funnel guard only matches identifiers literally named `supabase`; `getSupabaseClient().from()` or aliased clients bypass it.
- `gradeQuiz` caps answers at 200 while `getFreeQuestions` is unbounded — >200 free questions would make every grading fail.
- `_bmad-output/project-context.md` ("10 domande", "anteprima quiz", no Fredoka) and root `REPORT_STATO_PROGETTO.md` (`lib/content`, `submitQuizCompletion`, secret key) are stale versus the 2026-09-28 spec.
