"use client";

import { useEffect } from "react";
import { QuizCard } from "@/components/ui/quiz-card";
import { ButtonPrimary } from "@/components/ui/button-primary";

/** Shown when the free questions can't be loaded (Supabase down, RLS change). */
export default function QuizError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[quiz] failed to load:", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col px-[22px] py-[44px] xl:px-[56px] xl:py-[80px]">
      <QuizCard className="mx-auto flex w-full max-w-md flex-col gap-4">
        <p role="alert" className="font-sans text-[15px] text-text-primary">
          Non riusciamo a caricare il quiz in questo momento.
        </p>
        <ButtonPrimary variant="compact" onClick={() => unstable_retry()}>
          Riprova
        </ButtonPrimary>
      </QuizCard>
    </main>
  );
}
