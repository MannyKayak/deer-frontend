import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret key (AD-5). RLS on
 * `quiz_completions` has zero policies, so only this key (which bypasses
 * RLS) can read/write the table — never the publishable key.
 */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in server env");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}

export type QuizCompletionRecord = {
  score: number;
  feedback?: 1 | 2 | 3 | 4 | 5;
  email?: string;
  completedAt: string;
};

export async function insertQuizCompletion(record: QuizCompletionRecord) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("quiz_completions").insert({
    score: record.score,
    feedback: record.feedback ?? null,
    email: record.email ?? null,
    completed_at: record.completedAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}
