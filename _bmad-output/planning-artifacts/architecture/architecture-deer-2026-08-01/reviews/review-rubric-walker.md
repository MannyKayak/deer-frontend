# Review: ARCHITECTURE-SPINE.md (Deer — Landing + Quiz di Assaggio)

Reviewer: rubric-walker
Target: `_bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md`
Cross-checked against: PRD (`prd.md`), memlog (`.memlog.md`), DESIGN.md, `app/`, `package.json`, `_bmad-output/project-context.md`.

## Verdict

Solid, mostly faithful spine — 11 ADs correctly distill the memlog with no invention or loss, the Structural Seed extends the stock scaffold cleanly, and 11 of 12 FRs plus 2 of 3 NFRs are genuinely covered by an AD or map row. The one real hole is NFR-2 (performance): it's declared bound in the frontmatter but never actually addressed anywhere in the body, map, or Deferred — a silent drop rather than a decision. There's also an underspecified operational dimension (Preview-environment access to the single shared Supabase project) that this checklist explicitly asks to check and the spine leaves genuinely ambiguous, plus no mention of error monitoring.

## Findings

### 1. [Medium] NFR-2 (performance) is claimed bound but never covered

Frontmatter line 11 lists `NFR-2` in `binds`, but:
- No AD addresses it (AD-1 through AD-11 are stack/persistence/content/design/actions/routing/analytics/tokens/env — none is a performance AD).
- The Capability → Architecture Map (lines 173-185) only has rows for NFR-1 and NFR-3. NFR-2 has no row.
- It isn't in Deferred either.

The PRD is explicit that this was punted to architecture: *"Nessun budget quantitativo di performance fissato in questa fase [ASSUMPTION: ... se servono, vanno definiti in fase di architettura]"* (PRD §5, NFR-2). DESIGN.md even references NFR-2 once (390/1280 breakpoints), but that's a UX artifact, not an architectural decision about e.g. image handling, bundle budget, or Core Web Vitals targets. The spine's own paradigm section (Server-first Islands, minimal client JS) is *relevant* to performance but is never explicitly tied to NFR-2 as a Rule, so it can't be checked off as "covered by the map."

Fix: either add a row to the Capability → Architecture Map pointing NFR-2 at AD-8 (Server Components minimize client JS) + AD-4/AD-10 (no extra token/CSS systems bloating the bundle), or move NFR-2 to Deferred explicitly with a rationale ("no quantitative budget set this slice, revisit post-launch"). Right now it's neither decided nor deferred — just missing.

### 2. [Medium] Preview-environment Supabase access is a real, undecided divergence point

AD-11's Rule states: *"One Supabase project (EU-Frankfurt) serves local dev and production."* But the Deployment & environments diagram (lines 162-169) only draws edges `Dev --> SupabaseProj` and `Prod --> SupabaseProj` — **Preview has no edge to SupabaseProj at all.** That's inconsistent with AD-11's own wording (which says "dev and production," silent on preview) and leaves an unanswered operational question that squarely belongs to this altitude (Vercel env var scoping is exactly the kind of thing a story implementer has to resolve one way or the other):

- If Preview deploys *do* get `SUPABASE_SERVICE_ROLE_KEY` (implied by "single project" in AD-11), every PR preview's feedback-form submissions land in the same table backing SM-1/SM-2 (completion rate, email opt-in rate) — polluting the exact metrics this slice exists to produce, with no guard mentioned anywhere.
- If Preview deploys *don't* get the key (consistent with the diagram as drawn), the FR-9/FR-10/FR-11 write path is untestable in a PR preview before merge — a real gap for a slice whose sole DB interaction is that write.

Either answer is legitimate, but the spine doesn't pick one — the diagram and the AD text actually disagree with each other on this point. Worth a one-line Rule addition (e.g. "Preview deployments share the same project; a `source=preview` flag distinguishes test rows" or "Preview deployments omit `SUPABASE_SERVICE_ROLE_KEY`; the write path is verified via local dev only pre-merge").

### 3. [Low-Medium] Error monitoring is not mentioned anywhere

The checklist for this review specifically calls out checking whether env var management, secrets, and *error monitoring* are covered by the operational envelope. Secrets/env vars are covered reasonably well (AD-5, Consistency Conventions row on state/cross-cutting). Error monitoring is absent — no Sentry/Vercel-analytics-errors/log-drain mention, not in an AD, not in Deferred. For a slice this small the omission is defensible, but per AD-5's own error-shape convention (`{ ok: false, error: string }`, "never throws to the client for expected validation failures") there's an implicit unexpected-failure path (Supabase insert throwing, e.g. network blip) with no stated destination for that signal. Recommend either a one-line Rule ("unexpected Server Action errors are logged via Vercel's default function logs; no external error-monitoring service this slice") or an explicit Deferred entry — right now it's silently unaddressed rather than a stated non-goal.

### 4. [Low] A few ADs lean on convention only, with no enforcement mechanism named

AD-5 and AD-8 are concretely enforceable (the `server-only` package produces a build error; `'use client'` file-boundary is checkable by inspection or a lint rule). AD-6 ("all content reads through `lib/content/index.ts`"), AD-9 ("all tracking calls through `lib/analytics/track.ts`"), and AD-10 ("no `var(--token)` arbitrary values") state real, checkable rules, but nothing in the doc names how they'd be enforced beyond code review (e.g. an ESLint `no-restricted-imports` rule against the raw content/analytics-SDK modules). Not a blocker — code-review enforcement is normal at this altitude — but worth flagging since the checklist explicitly asks whether each AD's Rule is enforceable, and these three are softer than the other eight.

### 5. [Low, informational] No mention of Row-Level Security on the completion table

The one Supabase table (FR-11 completion records) is only ever written via a service-role key server-side (AD-5), which bypasses RLS regardless of whether it's configured. So this isn't a functional gap, just a defense-in-depth note: if the service-role key ever leaked, an RLS-less table is fully exposed. Not required for this slice's stated threat model, but worth one line in AD-5 or NFR-3 acknowledging the table has no RLS policy this slice (or that it does, if intended).

## Checklist walk-through (summary)

- **Divergence points fixed for story altitude:** Yes, the 11 ADs cover the actual points a story-level implementer could diverge on (write timing, content source, routing/state, RSC/client boundary, token system, analytics naming, env scoping). No missing AD for a real divergence risk found beyond items above.
- **Every AD's Rule enforceable and actually prevents its divergence:** 8/11 concretely so (AD-1/2/3/4/5/7/8/11); AD-6/9/10 enforceable only via review, not tooling (see Finding 4) — still real rules, just softer.
- **Nothing in Deferred should have been fixed now:** Confirmed — OQ-1..OQ-6, DB-migration-of-content, auth, and Server Action rate-limiting are all legitimately deferrable; none creates a two-unit divergence risk if left open.
- **Named tech verified-current:** Next.js 16.2.12 / React 19.2.4 match `package.json` exactly. Tailwind v4, `server-only` ^0.0.1 unremarkable. `@supabase/supabase-js` ^2.111.0 and `zod` ^4.4.3 aren't in `package.json` yet (not installed pre-implementation, as expected) — can't be cross-verified from the repo, flagging per instructions rather than re-verifying myself.
- **Ratifies existing codebase:** Yes. `app/` is confirmed stock create-next-app (`layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico` only, Geist fonts, "Create Next App" metadata). The Structural Seed keeps `app/layout.tsx`, `app/page.tsx`, `app/globals.css` as the same three files and only adds new `components/` and `lib/` trees — no contradiction, no claim that the current file contents already match the target (fonts/metadata will need to change during implementation, which is expected, not a spine defect).
- **Capability → Architecture Map vs PRD FR-1..FR-12, NFR-1..NFR-3:** FR-1 through FR-12 all have a map row. NFR-1 and NFR-3 have rows. **NFR-2 does not** (Finding 1).
- **No whole dimension left silent:** Deployment topology, stack, mutation boundary, content source, design tokens, analytics are all decided. Two sub-dimensions of the operational envelope are genuinely thin: Preview-environment DB access (Finding 2) and error monitoring (Finding 3).
- **Memlog fidelity:** Spine faithfully distills the memlog — every memlog "(decision)"/"(constraint)"/"(direction)" bullet maps to an AD, the Deferred section, or the Stack/Deployment tables, with no invented material. The one refinement (memlog's "Route Handler/Server Action" for FR-11 → spine commits specifically to Server Action) is a legitimate resolution of an open choice during spine-writing, not a contradiction.
