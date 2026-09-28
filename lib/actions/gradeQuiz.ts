"use server";

import "server-only";
import { z } from "zod";
import { checkAnswer, getMnemonics } from "@/lib/data/questions";
import type { QuizMnemonic } from "@/lib/data/types";

const answersSchema = z
  .array(
    z.object({
      questionId: z.uuid(),
      optionId: z.uuid(),
    }),
  )
  .min(1)
  .max(200)
  .refine((answers) => new Set(answers.map((a) => a.questionId)).size === answers.length);

export type QuestionResult = {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string | null;
  mnemonic: QuizMnemonic | null;
};

export type GradeQuizResult = { ok: true; results: QuestionResult[] } | { ok: false; error: string };

/**
 * Grades a finished quiz via `check_answer` (read-only, no DB write).
 * Correctness never comes from the client. A pair the RPC rejects
 * (question not visible / option not in question) counts as wrong.
 * Mnemonics are returned here, never with the questions (CAP-6).
 */
export async function gradeQuiz(answers: { questionId: string; optionId: string }[]): Promise<GradeQuizResult> {
  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success) {
    return { ok: false, error: "Risposte non valide." };
  }

  try {
    const [checks, mnemonics] = await Promise.all([
      Promise.all(parsed.data.map(({ questionId, optionId }) => checkAnswer(questionId, optionId))),
      getMnemonics(parsed.data.map((a) => a.questionId)),
    ]);
    const results = parsed.data.map(({ questionId }, i) => ({
      questionId,
      isCorrect: checks[i]?.isCorrect ?? false,
      correctOptionId: checks[i]?.correctOptionId ?? null,
      mnemonic: mnemonics.get(questionId) ?? null,
    }));
    return { ok: true, results };
  } catch (error) {
    console.error("[gradeQuiz] check failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "Non riusciamo a correggere il quiz. Riprova." };
  }
}
