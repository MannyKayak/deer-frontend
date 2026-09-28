import "server-only";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Mailing-list signup — the only write the landing makes (anon insert, RLS
 * owned by the backoffice). Shared by the landing section and the post-quiz
 * capture. `email` must already be lowercased.
 *
 * The deployed `email_signups` table has only `email` (+ defaults): no source,
 * no consent proof, no unique constraint yet — pending backoffice (spec OQ-11).
 */
export async function insertEmailSignup(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("email_signups").insert({ email });

  if (error) {
    throw new Error(error.message);
  }
}
