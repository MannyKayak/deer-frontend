import { QuizCard } from "@/components/ui/quiz-card";
import { EmailSignupForm } from "@/components/landing/email-signup-form";

export function EmailSignupSection() {
  return (
    <section id="aggiornamenti" className="px-[22px] py-[44px] xl:px-[56px] xl:py-[80px]">
      <div className="mx-auto flex max-w-page flex-col gap-8 xl:flex-row xl:items-center xl:gap-16">
        <div className="flex flex-col gap-2 xl:flex-1">
          <h2 className="font-lexend text-[20px] font-bold text-text-primary xl:text-[30px]">
            Non sei pronto per il quiz?
          </h2>
          <p className="max-w-2xl font-sans text-[15px] leading-[1.5] text-text-secondary xl:text-lg">
            Lasciaci la tua email: ti avvisiamo quando Remindeer sarà pronto.
          </p>
        </div>
        <QuizCard className="w-full xl:max-w-md xl:flex-1">
          <EmailSignupForm />
        </QuizCard>
      </div>
    </section>
  );
}
