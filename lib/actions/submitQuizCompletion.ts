"use server";

import "server-only";
import { z } from "zod";
import { getQuestions } from "@/lib/content";
import { insertQuizCompletion } from "@/lib/supabase/client";

const answerSchema = z.object({
  questionId: z.coerce.number(),
  selectedOptionId: z.string(),
});

const inputSchema = z.object({
  answers: z.string().transform((value, ctx) => {
    try {
      return z.array(answerSchema).parse(JSON.parse(value));
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid answers payload" });
      return z.NEVER;
    }
  }),
  feedback: z.union([z.coerce.number().min(1).max(5), z.literal("")]).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export type SubmitQuizCompletionState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

/**
 * Single completion write (AD-2, AD-5). Score is recomputed server-side
 * from `lib/content` — the client never supplies a score. Called via
 * `useActionState` + `<form action>`, never an imperative fetch.
 */
export async function submitQuizCompletion(
  _prevState: SubmitQuizCompletionState,
  formData: FormData,
): Promise<SubmitQuizCompletionState> {
  const parsed = inputSchema.safeParse({
    answers: formData.get("answers"),
    feedback: formData.get("feedback") ?? undefined,
    email: formData.get("email") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "Dati non validi." };
  }

  const { answers, feedback, email } = parsed.data;
  const consent = formData.get("consent") === "true";

  const questions = getQuestions();
  const score = answers.filter((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return question?.correctOptionId === answer.selectedOptionId;
  }).length;

  try {
    await insertQuizCompletion({
      score,
      feedback: feedback === "" || feedback === undefined ? undefined : (feedback as 1 | 2 | 3 | 4 | 5),
      email: consent && email ? email : undefined,
      completedAt: new Date().toISOString(),
    });
  } catch {
    return { ok: false, error: "Invio non riuscito. Riprova." };
  }

  return { ok: true };
}
