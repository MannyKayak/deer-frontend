"use client";

import { useActionState, useEffect, useState } from "react";
import { QuizCard } from "@/components/ui/quiz-card";
import { MnemoBox } from "@/components/ui/mnemo-box";
import { StarRating } from "@/components/ui/star-rating";
import { EmailCapture } from "@/components/ui/email-capture";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { submitQuizCompletion } from "@/lib/actions/submitQuizCompletion";
import { track } from "@/lib/analytics/track";
import type { Question } from "@/lib/content";

type Answer = { questionId: number; selectedOptionId: string };

export function ResultsScreen({
  questions,
  answers,
}: {
  questions: Question[];
  answers: Answer[];
}) {
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, formAction, isPending] = useActionState(submitQuizCompletion, null);

  useEffect(() => {
    if (state?.ok) {
      track("quiz_completed");
    }
  }, [state]);

  const correctCount = answers.filter((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return question?.correctOptionId === answer.selectedOptionId;
  }).length;

  return (
    <QuizCard className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-lexend text-[26px] font-bold text-primary-dark">
          {correctCount}/{questions.length} corrette
        </span>
        <p className="font-sans text-[15px] text-text-secondary">
          Ecco tutte le mnemotecniche che hai incontrato.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {questions.map((question) => (
          <MnemoBox key={question.id}>{question.mnemonic}</MnemoBox>
        ))}
      </div>
      {state?.ok ? (
        <p className="font-sans text-[13px] text-text-secondary">Grazie per il tuo feedback!</p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="answers" value={JSON.stringify(answers)} />
          <input type="hidden" name="feedback" value={rating === 0 ? "" : rating} />
          <input type="hidden" name="consent" value={consent ? "true" : "false"} />
          <div className="flex flex-col gap-2">
            <span className="font-lexend text-[15px] font-semibold text-text-primary">
              Com&apos;è andata?
            </span>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <EmailCapture email={email} onEmailChange={setEmail} consent={consent} onConsentChange={setConsent} />
          {state && !state.ok ? (
            <p className="font-sans text-[13px] text-error">{state.error} Il tuo punteggio resta visibile qui sopra.</p>
          ) : null}
          <ButtonPrimary type="submit" variant="compact" disabled={isPending}>
            {isPending ? "Invio..." : "Invia"}
          </ButtonPrimary>
        </form>
      )}
    </QuizCard>
  );
}
