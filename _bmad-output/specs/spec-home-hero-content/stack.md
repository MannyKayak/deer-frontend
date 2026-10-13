# Stack Notes

Facts verified in the repo on 2026-10-13. Re-check before relying on them.

## Next.js caching (installed: 16.2.12)

- `cacheComponents` is not enabled in `next.config.ts`, so the previous caching model applies (`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`). Enabling it is a repo-wide change and out of scope.
- `supabase.rpc` is not a tagged `fetch`; a non-`fetch` read is cached with `unstable_cache(fn, keyParts, { tags, revalidate })`.
- `revalidateTag(tag)` with one argument is deprecated. `revalidateTag(tag, "max")` is stale-while-revalidate; for webhooks that need immediate expiry the docs prescribe `revalidateTag(tag, { expire: 0 })` (`.../04-functions/revalidateTag.md`).
- Segment config `revalidate` must be a statically analyzable literal (`3600`, not `60 * 60`).
- In development pages are never cached; static-ness is checked only in the `next build` output.

## Hosting

- `next.config.ts` has no `output: "export"`.
- Vercel, confirmed by the PO on 2026-10-13 (no `vercel.json`, `.vercel/` or CI workflow in the repo). Server runtime available; on-demand revalidation supported.

## Environment

- In use: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` — server-only, not `NEXT_PUBLIC_*`. The image URL and the `next/image` remote host are therefore derived on the server / at build time.
- New: `REVALIDATE_SECRET`, server-only.
- Documented in `.env.example` (decided 2026-10-13; the file does not exist yet): variable names without values, plus the webhook setup steps as comments.

## Tooling

- Tests: Vitest, `__tests__/`, with a `server-only` stub in `__tests__/stubs/`.
- `package.json` has no `typecheck` script; typecheck = `tsc --noEmit`.
- Lint blocks `supabase.from` / `rpc` / `storage` / `auth` outside `lib/data/`.

## Files in play

- `components/landing/hero.tsx` — hard-coded copy, `TRUST_STATS`, static image.
- `app/page.tsx` — no data fetching today.
- `lib/data/` — new home-content function; `lib/data/questions.ts` is the model.
- `lib/supabase/database.types.ts` — generated, never hand-edited.
- `next.config.ts` — image remote host.
- `app/api/revalidate/route.ts` — new.
