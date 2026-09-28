import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Server-only Supabase client using the publishable key (phase 1: no login,
 * every call runs as `anon`). What anon can read/write is enforced by RLS in
 * the shared project, whose schema is owned by the backoffice repo (ADR-004).
 * `database.types.ts` is generated — regenerate with
 * `supabase gen types typescript --linked`, never edit by hand.
 */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in server env");
  }

  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false },
  });
}
