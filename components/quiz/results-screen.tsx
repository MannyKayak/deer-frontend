"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { QuizCard } from "@/components/ui/quiz-card";
import { CategoryTag } from "@/components/ui/category-tag";
import { MnemoBox } from "@/components/ui/mnemo-box";
import { AnswerOption } from "@/components/ui/answer-option";
import { StarRating } from "@/components/ui/star-rating";
import { EmailCapture } from "@/components/ui/email-capture";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { gradeQuiz, type GradeQuizResult } from "@/lib/actions/gradeQuiz";
import { submitEmailSignup } from "@/lib/actions/submitEmailSignup";
import { track } from "@/lib/analytics/track";
import type { QuizQuestion } from "@/lib/data/types";
import type { QuizAnswer } from "@/components/quiz/quiz-flow";

type ResultsFormState = { ok: true } | { ok: false; error: string; feedbackSent: boolean } | null;

/**
 * Feedback goes to analytics only; the email (if any) joins the mailing list.
 * The landing never writes anything else to the DB. The rating is sent
 * independently of the email (CAP-9): an email without consent is withheld
 * (3.2 AC #3), and a failed signup never drops the rating.
 */
async function submitResultsForm(prevState: ResultsFormState, formData: FormData): Promise<ResultsFormState> {
  const rating = Number(formData.get("feedback"));
  const email = String(formData.get("email") ?? "").trim();
  const consent = formData.get("consent") === "true";

  // A retry after a failed signup must not re-send the rating.
  const feedbackSent = prevState?.ok === false && prevState.feedbackSent;
  if (!feedbackSent && rating >= 1 && rating <= 5) {
    track("quiz_feedback", { rating });
  }

  if (email && consent) {
    const result = await submitEmailSignup(null, formData);
    if (!result?.ok) {
      return { ok: false, error: result?.error ?? "Invio non riuscito. Riprova.", feedbackSent: true };
    }
    track("email_signup_quiz");
  }
  return { ok: true };
}

export function ResultsScreen({
  questions,
  answers,
  onRetry,
}: {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  onRetry: () => void;
}) {
  const [grading, setGrading] = useState<GradeQuizResult | null>(null);
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, formAction, isPending] = useActionState(submitResultsForm, null);

  // Only the latest grading request may update state; unmount invalidates all.
  const requestIdRef = useRef(0);

  const runGrading = useCallback(() => {
    const requestId = ++requestIdRef.current;
    gradeQuiz(answers)
      .catch((): GradeQuizResult => ({ ok: false, error: "Non riusciamo a correggere il quiz. Riprova." }))
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setGrading(result);
        if (result.ok) {
          track("quiz_completed", {
            score: result.results.filter((r) => r.isCorrect).length,
            total: questions.length,
          });
        }
      });
  }, [answers, questions.length]);

  useEffect(() => {
    runGrading();
    return () => {
      requestIdRef.current++;
    };
  }, [runGrading]);

  if (grading === null) {
    return (
      <QuizCard className="mx-auto w-full max-w-md">
        <p role="status" className="font-sans text-[15px] text-text-primary">
          Correggiamo le tue risposte…
        </p>
      </QuizCard>
    );
  }

  if (!grading.ok) {
    return (
      <QuizCard className="mx-auto flex w-full max-w-md flex-col gap-4">
        <p role="alert" className="font-sans text-[15px] text-error">
          {grading.error}
        </p>
        <ButtonPrimary
          variant="compact"
          onClick={() => {
            setGrading(null);
            runGrading();
          }}
        >
          Riprova
        </ButtonPrimary>
      </QuizCard>
    );
  }

  const resultById = new Map(grading.results.map((r) => [r.questionId, r]));
  const chosenById = new Map(answers.map((a) => [a.questionId, a.optionId]));
  const canSubmit = rating > 0 || email.trim() !== "";
  const correctCount = grading.results.filter((r) => r.isCorrect).length;

  return (
    <QuizCard className="mx-auto flex w-full max-w-md flex-col gap-6">
      <span className="font-fredoka text-[26px] font-bold text-primary-dark">
        {correctCount}/{questions.length} corrette
      </span>

      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => {
          const result = resultById.get(question.id);
          const isCorrect = result?.isCorrect ?? false;
          const chosen = question.options.find((o) => o.id === chosenById.get(question.id));
          const correct = question.options.find((o) => o.id === result?.correctOptionId);
          const mnemonic = result?.mnemonic;
          return (
            <li key={question.id} className="flex flex-col gap-2 border-b-2 border-border-neutral pb-4 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CategoryTag>{question.category}</CategoryTag>
                <span className={`font-sans text-[13px] font-bold ${isCorrect ? "text-correct" : "text-error"}`}>
                  <span aria-hidden="true">{isCorrect ? "✓ " : "✗ "}</span>
                  {isCorrect ? "Corretta" : "Sbagliata"}
                </span>
              </div>
              <p className="font-sans text-[15px] font-medium leading-[1.4] text-text-primary">
                {index + 1}. {question.text}
              </p>
              {!isCorrect ? (
                <div className="flex flex-col gap-2">
                  {chosen ? (
                    <AnswerOption state="incorrect" disabled>
                      {chosen.text}
                    </AnswerOption>
                  ) : null}
                  {correct && correct.id !== chosen?.id ? (
                    <AnswerOption state="correct" disabled>
                      {correct.text}
                    </AnswerOption>
                  ) : null}
                  {mnemonic && (mnemonic.text || mnemonic.imageUrl) ? (
                    <MnemoBox imageUrl={mnemonic.imageUrl}>{mnemonic.text}</MnemoBox>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <ButtonPrimary onClick={onRetry}>Ritenta</ButtonPrimary>

      {state?.ok ? (
        <p role="status" className="font-sans text-[13px] text-text-secondary">
          Grazie per il tuo feedback!
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="feedback" value={rating === 0 ? "" : rating} />
          <input type="hidden" name="source" value="quiz" />
          <input type="hidden" name="consent" value={consent ? "true" : "false"} />
          <div className="flex flex-col gap-2">
            <span className="font-fredoka text-[15px] font-semibold text-text-primary">Com&apos;è andata?</span>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <EmailCapture email={email} onEmailChange={setEmail} consent={consent} onConsentChange={setConsent} />
          {state && !state.ok ? (
            <p role="alert" className="font-sans text-[13px] text-error">
              {state.error}
            </p>
          ) : null}
          <ButtonPrimary type="submit" variant="compact" disabled={isPending || !canSubmit}>
            {isPending ? "Invio..." : "Invia"}
          </ButtonPrimary>
        </form>
      )}
    </QuizCard>
  );
}
