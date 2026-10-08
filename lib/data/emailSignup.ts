import "server-only";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SignupSource } from "@/lib/consent";

const UNIQUE_VIOLATION = "23505";

/**
 * Mailing-list signup — the only write the landing makes (anon insert, RLS
 * owned by the backoffice). Shared by the landing section and the post-quiz
 * capture. `email` must already be lowercased.
 *
 * Stores the consent proof with the row: the form it came from and the version
 * of the consent text accepted. `consent_given_at` is set by the database.
 * An email already on the list is not an error: the visitor gets the same
 * outcome, and the response never reveals who is subscribed.
 */
export async function insertEmailSignup(signup: {
  email: string;
  source: SignupSource;
  consentTextVersion: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("email_signups").insert({
    email: signup.email,
    source: signup.source,
    consent_text_version: signup.consentTextVersion,
  });

  if (error && error.code !== UNIQUE_VIOLATION) {
    throw new Error(error.message);
  }
}
