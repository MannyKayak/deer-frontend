"use client";

import { useEffect, useState } from "react";
import { QuizCard } from "@/components/ui/quiz-card";
import { CategoryTag } from "@/components/ui/category-tag";
import { AnswerOption } from "@/components/ui/answer-option";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { ContentImage } from "@/components/ui/content-image";
import { ResultsScreen } from "@/components/quiz/results-screen";
import { track } from "@/lib/analytics/track";
import { shuffleOptions } from "@/lib/quiz/shuffle";
import type { QuizQuestion } from "@/lib/data/types";

export type QuizAnswer = { questionId: string; optionId: string };

/**
 * In-memory quiz (AD-7): a pick can be changed until "Avanti" advances, nothing
 * is revealed until the results screen. Question count comes from the data.
 */
export function QuizFlow({ questions: initialQuestions }: { questions: QuizQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    track("quiz_started");
  }, []);

  function handleRetry() {
    setQuestions(shuffleOptions(initialQuestions));
    setCurrentIndex(0);
    setAnswers([]);
    setFinished(false);
    track("quiz_started");
  }

  if (finished) {
    return <ResultsScreen questions={questions} answers={answers} onRetry={handleRetry} />;
  }

  const question = questions[currentIndex];
  const selectedOptionId = answers.find((answer) => answer.questionId === question.id)?.optionId ?? null;
  const isLast = currentIndex === questions.length - 1;

  function handleSelect(optionId: string) {
    // Replace in the updater: one answer per question, the latest tap wins.
    setAnswers((prev) => [
      ...prev.filter((answer) => answer.questionId !== question.id),
      { questionId: question.id, optionId },
    ]);
  }

  function handleNext() {
    if (selectedOptionId === null) return;
    if (isLast) {
      setFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <QuizCard className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CategoryTag>{question.category}</CategoryTag>
        <CategoryTag>
          Domanda {currentIndex + 1} di {questions.length}
        </CategoryTag>
      </div>
      <p className="font-sans text-[17px] font-semibold leading-[1.4] text-text-primary">{question.text}</p>
      {question.imageUrl ? <ContentImage src={question.imageUrl} alt="Immagine della domanda" /> : null}
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            state={option.id === selectedOptionId ? "selected" : "default"}
            onClick={() => handleSelect(option.id)}
          >
            {option.text}
          </AnswerOption>
        ))}
      </div>
      {selectedOptionId !== null ? (
        <ButtonPrimary onClick={handleNext}>{isLast ? "Vedi i risultati" : "Avanti"}</ButtonPrimary>
      ) : null}
    </QuizCard>
  );
}
