import { questions, type Question } from "./questions";

/**
 * Sole accessor for question/mnemonic content (AD-6). No component may
 * import `questions.ts` directly — this is the one seam that absorbs
 * a future move to Supabase without touching call sites.
 */
export function getQuestions(): Question[] {
  return questions;
}

export function getPreviewQuestion(): Question {
  return questions[0];
}

export type { Question, QuestionOption } from "./questions";
