/**
 * Client-safe shapes returned by lib/data. No `is_correct` anywhere:
 * correctness is only knowable server-side via `checkAnswer`. Mnemonics are
 * not part of `QuizQuestion`: they reach the browser only after grading.
 */
export type QuizOption = {
  id: string;
  text: string;
};

export type QuizMnemonic = {
  text: string | null;
  imageUrl: string | null;
};

export type QuizQuestion = {
  id: string;
  officialNumber: number;
  text: string;
  category: string;
  imageUrl: string | null;
  options: QuizOption[];
};

export type AnswerCheck = {
  isCorrect: boolean;
  correctOptionId: string;
};
