import "server-only";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AnswerCheck, QuizMnemonic, QuizQuestion } from "./types";

const IMAGE_BUCKET = "question-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Every free question (RLS exposes only `is_free = true` to anon), ordered by
 * official number. Columns are always listed: `select *` fails because
 * `question_options.is_correct` is not readable by anon.
 */
export async function getFreeQuestions(): Promise<QuizQuestion[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select(
      `id, official_number, text,
       categories(name),
       image:images(storage_path),
       question_options(id, text, position)`,
    )
    .eq("is_free", true)
    .order("official_number", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const paths = data.flatMap((row) => (row.image?.storage_path ? [row.image.storage_path] : []));
  const imageUrls = await getImageUrls(paths);

  return data.map((row) => ({
    id: row.id,
    officialNumber: row.official_number,
    text: row.text,
    category: row.categories.name,
    imageUrl: row.image ? (imageUrls.get(row.image.storage_path) ?? null) : null,
    options: [...row.question_options]
      .sort((a, b) => a.position - b.position)
      .map((option) => ({ id: option.id, text: option.text })),
  }));
}

/**
 * Mnemonics for the given free questions, keyed by question id. Read only
 * after grading, so no mnemonic reaches the browser during the quiz (CAP-6).
 * A mnemonic whose text is empty and whose image failed to sign is omitted.
 */
export async function getMnemonics(questionIds: string[]): Promise<Map<string, QuizMnemonic>> {
  const mnemonics = new Map<string, QuizMnemonic>();
  if (questionIds.length === 0) return mnemonics;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, mnemonics(text, image:images(storage_path))")
    .in("id", questionIds);

  if (error) {
    throw new Error(error.message);
  }

  const paths = data.flatMap((row) => (row.mnemonics?.image?.storage_path ? [row.mnemonics.image.storage_path] : []));
  const imageUrls = await getImageUrls(paths);

  for (const row of data) {
    if (!row.mnemonics) continue;
    const text = row.mnemonics.text || null;
    const imageUrl = row.mnemonics.image ? (imageUrls.get(row.mnemonics.image.storage_path) ?? null) : null;
    if (text || imageUrl) {
      mnemonics.set(row.id, { text, imageUrl });
    }
  }
  return mnemonics;
}

/**
 * Signed URLs for files in the private `question-images` bucket, keyed by
 * storage path. Paths that fail to sign are omitted — callers treat a
 * missing URL as "no image".
 */
export async function getImageUrls(paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrls([...new Set(paths)], SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("[getImageUrls] signing failed:", error.message);
    return urls;
  }

  for (const entry of data) {
    if (entry.path && entry.signedUrl && !entry.error) {
      urls.set(entry.path, entry.signedUrl);
    }
  }
  return urls;
}

/**
 * Server-side answer check via the `check_answer` RPC. Returns `null` when the
 * pair is invalid for anon — P0002 (question not visible) or 22023 (option not
 * in question); any other error throws.
 */
export async function checkAnswer(questionId: string, optionId: string): Promise<AnswerCheck | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("check_answer", {
    p_question_id: questionId,
    p_option_id: optionId,
  });

  if (error) {
    if (error.code === "P0002" || error.code === "22023") return null;
    throw new Error(error.message);
  }

  const result = data[0];
  if (!result) return null;
  return { isCorrect: result.is_correct, correctOptionId: result.correct_option_id };
}
