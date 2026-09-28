# lib/data

Rule: no component, page, or server action may call `supabase.from(...)`, `supabase.rpc(...)`, `supabase.storage.*` or `supabase.auth.*` directly — all data access goes through a named function here (ADR-003).

Minimal conforming example:

```ts
// lib/data/emailSignup.ts
import "server-only";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function insertEmailSignup(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("email_signups").insert({ email });
  if (error) throw new Error(error.message);
}
```

Enforced by the `no-restricted-syntax` rule in `eslint.config.mjs` (fails lint/build on any of those calls outside this folder).

This same convention will be replicated in the future backoffice project (separate funnel, same discipline — not shared at this stage, per ADR-003).

The client runs as `anon` with the publishable key; the schema is owned by the backoffice repo (ADR-004). Never add migrations here — regenerate `lib/supabase/database.types.ts` with `supabase gen types typescript --linked`.
