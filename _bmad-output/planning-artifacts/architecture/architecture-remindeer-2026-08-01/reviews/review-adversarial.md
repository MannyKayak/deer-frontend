---
title: Adversarial Review — Architecture Spine (Remindeer, Landing + Quiz di Assaggio)
status: final
created: 2026-08-01
target: _bmad-output/planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md
method: construct compliant-but-incompatible builder pairs
---

# Adversarial Review — Architecture Spine

## Method

For each finding below I construct two concrete units (developers or agent-built stories) that each satisfy every applicable AD to the letter, working independently, that would still produce incompatible artifacts if built in parallel without out-of-band coordination. Each is a hole the spine should close with a new or tightened AD, or a tightened Consistency Convention entry.

---

## Finding 1 — Server Action calling convention is unspecified (SEVERITY: HIGH)

**Gap:** AD-5 fixes the Server Action's *file* (`lib/actions/submitQuizCompletion.ts`), its *effect* (validated Supabase insert, service-role key), and its *return shape* (`{ok:true}` / `{ok:false, error:string}`). It never fixes the action's *parameter signature* or how a Client Component invokes it — `useActionState`/`useFormState` bound to `<form action={...}>` (which requires the action's signature to be `(prevState, formData: FormData) => State`), vs. a plain async function called imperatively from an `onClick`/`onSubmit` handler with a typed JS object (`submitQuizCompletion({ score, feedback, email })`).

**Concrete clash:** Developer A builds `components/feedback/FeedbackForm.tsx` using `useActionState(submitQuizCompletion, { ok: undefined })` on a native `<form>`, so the action must accept `(prevState, formData)`. Developer B (a second story reusing/refactoring the same action for a "resend feedback" admin-adjacent path, or simply a parallel implementation) writes `submitQuizCompletion` as `(input: CompletionPayload) => Promise<ActionResult>` and calls it directly with `startTransition` + local `useState` for pending/error. Both satisfy AD-5's letter (single Server Action file, `'use server'`, validates server-side, correct return shape). They are not interchangeable: the `useActionState` caller passes `FormData`, the imperative caller passes a typed object — whichever implementation wins, the other story's component will not compile/type-check against it, and the error/pending state plumbing (`isPending`, `formState`) exists in one version and not the other.

**Fix direction:** Add an AD (or extend AD-5) pinning the Server Action's exact signature and the required client wiring pattern (e.g. "bound via `useActionState` to a native `<form>`; input received as `FormData`, parsed with a shared zod schema exported from the action module").

---

## Finding 2 — No canonical Server Action *input* schema; score computation ownership is undecided (SEVERITY: HIGH)

**Gap:** The Consistency Conventions table fixes the *stored* completion record shape (`{ score, feedback?, email?, completedAt }`) and says the action "validates input server-side" — but never states what the *input* to the action is, in particular whether `score` is computed client-side (quiz island tallies correct answers in its reducer and ships a number) or server-side (the action receives the raw answer set and recomputes the score against `lib/content` truth data).

**Concrete clash:** Story A (QuizFlow, AD-7) tracks correctness locally, and on completion its FeedbackForm-calling code passes `{ score: 7, feedback, email }` straight through. Story B (Server Action, AD-5) is written defensively — "never trust the client for a graded number" — so its zod schema requires `answers: { questionId: number; selectedOptionId: string }[]` and computes `score` itself via `lib/content`. Both comply with AD-2 (exactly one write, carries score) and AD-5 (validates input server-side). Wired together, Story A's payload fails Story B's zod schema (missing `answers`, extra untyped `score`), or Story B's payload contract silently drops the client's score and nothing in the spine says which of the two is authoritative — so a third story (analytics/QA reading the DB) can't know whether `score` in the table is client-reported or server-verified without reading code.

**Fix direction:** New AD: "Score is computed server-side inside the Server Action from submitted answers, validated against `lib/content`; the client never transmits a trusted score." (Or the opposite — but pick one and state the action's exact input schema.)

---

## Finding 3 — `completedAt` origin and FormData type coercion (SEVERITY: MEDIUM-HIGH)

**Gap:** The convention fixes `completedAt: ISO 8601 string` in the stored record but not whether it's generated client-side (captured the instant the user reaches the final screen) or server-side (stamped at insert time inside the action). Related: `feedback?: 1|2|3|4|5` is typed as a number, but if the Server Action is form-bound (per Finding 1's `useActionState` branch), `FormData.get('feedback')` returns a string or null — a zod schema of `z.number().int().min(1).max(5)` will reject every legitimate submission unless someone remembers `z.coerce.number()`.

**Concrete clash:** Developer A's action schema declares `completedAt: z.string().datetime()` as a required input field (trusting the client's timestamp, captured when FR-8's results screen mounts). Developer B's action ignores any submitted timestamp and stamps `completedAt: new Date().toISOString()` itself, per a stricter (arguably more correct, given AD-2's "exactly one write... on completion") reading — and its schema therefore rejects unknown/extra fields (`.strict()`) or simply never looks at a client-sent `completedAt`. Meanwhile the star-rating widget (FR-9), built as a set of radio inputs, ships `feedback="3"` (string) through native FormData; whichever developer wrote the zod number schema without `z.coerce` gets 100% validation failures on a fully compliant client component built by someone else.

**Fix direction:** State explicitly in AD-5 or the Consistency Conventions: (a) `completedAt` is server-stamped, never client-supplied; (b) the action's zod schema is the single source of truth for input types and must live in a location importable by both the client form and the action (or at minimum its coercion rules — `z.coerce.number()` for anything sourced from FormData — must be specified).

---

## Finding 4 — DB table/column naming and casing never fixed (SEVERITY: HIGH)

**Gap:** AD-5 says "performs the Supabase insert" but no AD names the table, and no AD states the column casing. The Consistency Conventions' completion-record shape is camelCase TypeScript (`completedAt`) — Postgres/Supabase convention is snake_case columns (`completed_at`). AD-11 mentions "the one write-only table" but never names it.

**Concrete clash:** Whoever provisions the Supabase schema (migration SQL, possibly OQ-5's PO-owned task) creates `quiz_completions(id, score, feedback, email, completed_at, created_at)` following Postgres snake_case convention. Whoever writes the insert call in `lib/actions/submitQuizCompletion.ts` — working purely from the spine's TS-shaped completion record — calls `supabase.from('completions').insert({ score, feedback, email, completedAt })` (wrong table name guess, camelCase keys). The `@supabase/supabase-js` client does not auto-map casing; this fails at runtime, not at compile time, so it passes review and breaks in preview/prod. Nothing in the spine designates a single seam (e.g. a `lib/supabase/schema.ts` or explicit table-name + column-mapping constant) that both the migration author and the action author must reference.

**Fix direction:** New AD or Structural Seed entry: pin the exact table name and column names (snake_case, matching Postgres convention), and require the mapping from the TS completion-record shape to DB columns to happen in exactly one place (e.g. inside `lib/supabase/`, not ad-hoc in the action).

---

## Finding 5 — `quiz_completed` analytics event: trigger point and reliability guarantee undefined (SEVERITY: MEDIUM-HIGH)

**Gap:** AD-9's dependency diagram shows both `QuizIsland` and `FeedbackForm` as callers of `Analytics`, but `ServerAction` has no edge to `Analytics` at all. FR-12 wants `quiz_completed` tracked, and FR-11 wants a DB write on completion — but the spine never says whether the analytics event fires optimistically (client-side, on form submit, regardless of DB outcome) or only after the Server Action confirms `{ok:true}`.

**Concrete clash:** Developer A (FeedbackForm, AD-9-compliant: "all tracking calls go through `lib/analytics/track.ts`") fires `track('quiz_completed')` synchronously inside the submit handler, before awaiting the Server Action's result — reasoning: FR-12 says abandonment/completion tracking is "best-effort," so fire-and-forget is fine. Developer B, building the same feature independently (or a later story hardening it), fires `track('quiz_completed')` only inside the branch that checks `result.ok === true` after awaiting the action, reasoning that an analytics "completed" event should mean "the record actually landed in Supabase." Both are AD-9-compliant (single wrapper, fixed event name). But now `quiz_completed` has two different, mutually exclusive semantics depending on which story shipped — analytics dashboards (SM-1, completion rate) built against one assumption will silently misreport if the other story's build is what's live, and a future story that patches in a retry-on-DB-failure path will double-count or under-count events depending on which trigger point it assumes.

**Fix direction:** Extend AD-9 (or add a new AD) to state exactly where each fixed event fires from — e.g. "`quiz_completed` fires only after the Server Action returns `{ok:true}`, from the Server Action's caller, never optimistically." Also make `events.ts` explicitly the *exhaustive* list (the spine currently says "a fixed event list ... (e.g. ...)" — "e.g." reads as illustrative, not exhaustive, which is itself a hole: nothing stops a story from adding an ad-hoc event name inline without registering it).

---

## Finding 6 — Preview question identity vs. the 1–10 id keyspace (SEVERITY: MEDIUM)

**Gap:** AD-6 mandates a dedicated `getPreviewQuestion()` accessor (distinct from `getQuestions()`), for FR-4's static landing preview. The Consistency Conventions constrain question/mnemonic records to "a stable numeric `id` (1–10)." Nothing states whether the preview card shows one of the graded 10 (e.g. always id 1, or a random one) or an 11th, uncounted placeholder record outside the 1–10 range.

**Concrete clash:** The content author (`lib/content/questions.ts`, AD-3/AD-6) ships exactly 10 records, ids 1–10, and implements `getPreviewQuestion()` as `getQuestions()[0]` (id 1) — reusing real content, satisfying "keyed 1–10." The landing developer (`components/landing/`, consuming `getPreviewQuestion()` per AD-6) independently assumes the preview is deliberately *not* one of the 10 real graded questions (to avoid the UX bug of a user seeing "Domanda 1" twice — once inert on the landing, once for real in the quiz) and requests/expects a dedicated preview record. If a second content story later adds a true 11th "preview-only" record to satisfy that expectation, it either breaks the "1–10" id convention (id 0 or 11) or requires an `isPreview` flag never specified in AD-3/AD-6's data shape — a schema change neither original builder anticipated, and downstream code (`getQuestions()` callers assuming exactly 10 sequential ids for progress-bar math, FR-5's "Domanda N di 10") may not tolerate an 11th record leaking into the array.

**Fix direction:** AD-3 or AD-6 should state explicitly whether the preview question is drawn from the graded 10 or is a separate out-of-band record, and if the latter, define its id/flag convention.

---

## Finding 7 — Dual-track validation: client-side email/rating checks vs. the server's zod schema (SEVERITY: MEDIUM)

**Gap:** FR-10 requires "no blocking validation beyond valid email format," and AD-5 puts server-side validation in the action. Nothing requires the client island's own pre-submit validation (if any) to share the same rules — the spine has no shared-validation seam (contrast with AD-6's single content accessor or AD-9's single analytics wrapper).

**Concrete clash:** Developer A builds the email field with a browser-native `type="email"` input and no extra JS validation, relying entirely on the Server Action's zod `.email()` check, surfaced back via the `{ok:false, error}` shape. Developer B, building the same field in a slightly different story pass (e.g. a UX-polish follow-up), adds a client-side regex pre-check with a stricter pattern (rejecting e.g. `+`-tagged addresses that zod's default `.email()` would accept) and blocks submission before the action is ever called. Both are FR-10-compliant on paper ("valid email format" is the only blocking rule) but a user with a `.email()`-valid, regex-invalid address gets a hard client-side block in one build and a successful submission in the other — inconsistent behavior depending on which story's component happens to be deployed, with no shared schema either side imports.

**Fix direction:** Require the Server Action's zod schema to be the single exported source of validation truth (e.g. exported from `lib/actions/submitQuizCompletion.ts` or a shared `lib/validation/` module) and mandate that any client-side pre-check, if present, imports it rather than reimplementing rules.

---

## Finding 8 — Unhandled/unexpected Server Action failures: throw vs. always-resolve (SEVERITY: MEDIUM)

**Gap:** AD-5's rule is scoped to "expected validation failures" ("never throws to the client for expected validation failures" → `{ok:false, error}`). It is silent on infrastructure failures (Supabase unreachable, insert throws for a non-validation reason). No AD requires the action to catch and normalize *all* failures, nor does the Structural Seed reserve an error-boundary component to catch a genuine throw.

**Concrete clash:** Developer A treats the AD-5 rule literally — only *expected* validation failures get the `{ok:false}` treatment; a genuine Supabase outage is allowed to throw, relying on Next.js's default error handling (digest-obfuscated error, nearest `error.tsx`/error boundary). Developer B wraps the entire action body in try/catch and always resolves with `{ok:false, error: 'unexpected'}`, never throwing under any circumstance. FeedbackForm, built by a third story against Developer B's contract, has no error boundary and no `try/catch` around its action call — it only branches on `result.ok`. Paired with Developer A's action, an infra failure produces an uncaught rejection with no UI handling (blank/broken final screen) instead of the inline error message the form was designed to show. Both action variants are individually AD-5-compliant.

**Fix direction:** Tighten AD-5 to require the action never throws under any circumstance — all failure modes (validation and infrastructure) resolve to `{ok:false, error:string}` — and/or explicitly require a `components/feedback/` error boundary as a backstop, named in the Structural Seed.

---

## Finding 9 — DESIGN.md token names vs. required component export/API names (SEVERITY: LOW-MEDIUM)

**Gap:** AD-4 requires DESIGN.md's component inventory (`quiz-card`, `answer-option`, `mnemo-box`, `category-tag`, `button-primary`) be "reused by name wherever that visual role recurs." DESIGN.md's names are kebab-case design tokens; the Consistency Conventions fix file naming (kebab-case) and component naming (PascalCase) but never state the required mapping from a DESIGN.md token name to an actual exported React component identifier/prop API.

**Concrete clash:** Developer A implements `components/ui/QuizCard.tsx` exporting `QuizCard`, used directly (`<QuizCard>...</QuizCard>`) everywhere the visual role recurs (FR-4 preview, FR-5 real question, FR-2 "Con Remindeer" column), per AD-4's literal instruction to reuse "the same `quiz-card` component." Developer B, building the comparison section (FR-2) independently, implements a generic `components/ui/Card.tsx` with a `variant="quiz-card" | "comparison-traditional"` prop, reasoning that DESIGN.md's `comparison-remindeer: inherits: quiz-card` note describes a *token inheritance* relationship, not necessarily a literal shared component instance. When a third story tries to compose the landing page importing both islands' expectations, one path expects `<QuizCard>`, the other expects `<Card variant="quiz-card">` — same visual role, two incompatible component APIs, and AD-4 doesn't specify which pattern (dedicated component vs. variant prop) is mandatory.

**Fix direction:** Extend AD-4 or the Structural Seed to fix the actual export name/API shape (e.g. "one `QuizCard` component in `components/ui/`, no variant-prop reimplementation") — not just "reuse the visual role."

---

## Summary Table

| # | Finding | Severity |
|---|---|---|
| 1 | Server Action calling convention (FormData/useActionState vs. imperative call) unspecified | High |
| 2 | Score computation ownership (client-trusted vs. server-recomputed) and action input schema undefined | High |
| 3 | `completedAt` origin (client vs. server) and FormData string/number coercion unspecified | Medium-High |
| 4 | DB table name and column casing never fixed; no single camelCase→snake_case mapping seam | High |
| 5 | `quiz_completed` analytics event trigger point (optimistic vs. post-confirmation) and events.ts exhaustiveness undefined | Medium-High |
| 6 | Preview question identity vs. the 1–10 id keyspace unresolved | Medium |
| 7 | No shared validation schema between client pre-checks and the Server Action's zod rules | Medium |
| 8 | Unexpected (non-validation) Server Action failures: throw vs. always-resolve, no error boundary reserved | Medium |
| 9 | DESIGN.md token names not mapped to a required component export/API convention | Low-Medium |
