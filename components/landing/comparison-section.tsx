import { ComparisonTraditional } from "@/components/landing/comparison-traditional";
import { ComparisonRemindeer } from "@/components/landing/comparison-remindeer";

export function ComparisonSection() {
  return (
    <section className="px-[22px] py-[44px] xl:px-[56px] xl:py-[80px]">
      <div className="mx-auto flex max-w-page flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-lexend text-[20px] font-bold text-text-primary xl:text-[30px]">
            Perché non è l&apos;ennesimo quiz
          </h2>
          <p className="max-w-2xl font-sans text-[15px] leading-[1.5] text-text-secondary xl:text-lg">
            La differenza non è quante domande vedi, ma se te le ricordi il giorno dell&apos;esame.
          </p>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
          <div className="xl:flex-1">
            <ComparisonTraditional />
          </div>
          <div className="xl:flex-1">
            <ComparisonRemindeer />
          </div>
        </div>
      </div>
    </section>
  );
}
