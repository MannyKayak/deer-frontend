"use client";

import { useEffect, useState } from "react";
import { getQuestions } from "@/lib/content";
import { QuizCard } from "@/components/ui/quiz-card";
import { CategoryTag } from "@/components/ui/category-tag";
import { AnswerOption } from "@/components/ui/answer-option";
import { MnemoBox } from "@/components/ui/mnemo-box";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { ResultsScreen } from "@/components/quiz/results-screen";
import { track } from "@/lib/analytics/track";

const questions = getQuestions();

type Answer = { questionId: number; selectedOptionId: string };

export function QuizFlow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    track("quiz_started");
  }, []);

  if (finished) {
    return <ResultsScreen questions={questions} answers={answers} />;
  }

  const question = questions[currentIndex];

  function handleSelect(optionId: string) {
    if (confirmed) return;
    setSelectedOptionId(optionId);
  }

  function handleConfirm() {
    if (selectedOptionId === null) return;
    if (!confirmed) {
      setAnswers((prev) => [...prev, { questionId: question.id, selectedOptionId }]);
      setConfirmed(true);
      return;
    }
    setSelectedOptionId(null);
    setConfirmed(false);
    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <QuizCard className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <CategoryTag>{question.category}</CategoryTag>
        <CategoryTag>
          Domanda {currentIndex + 1} di {questions.length}
        </CategoryTag>
      </div>
      <p className="font-lexend text-[17px] font-semibold leading-[1.4] text-text-primary">
        {question.question}
      </p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const isCorrectOption = option.id === question.correctOptionId;
          const isSelected = option.id === selectedOptionId;
          const state = !isSelected
            ? "default"
            : !confirmed
              ? "selected"
              : isCorrectOption
                ? "correct"
                : "incorrect";
          return (
            <AnswerOption
              key={option.id}
              state={state}
              disabled={confirmed}
              onClick={() => handleSelect(option.id)}
            >
              {option.text}
            </AnswerOption>
          );
        })}
      </div>
      {confirmed ? <MnemoBox>{question.mnemonic}</MnemoBox> : null}
      {selectedOptionId !== null ? (
        <ButtonPrimary onClick={handleConfirm}>{confirmed ? "Continua" : "Conferma"}</ButtonPrimary>
      ) : null}
    </QuizCard>
  );
}
