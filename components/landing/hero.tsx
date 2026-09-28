import { CategoryTag } from "@/components/ui/category-tag";
import { ButtonPrimary } from "@/components/ui/button-primary";

const TRUST_STATS = [
  { value: "3000", label: "domande ufficiali" },
  { value: "2 min", label: "per il quiz gratuito" },
  { value: "0", label: "login richiesti" },
];

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 px-[22px] text-center py-[44px] xl:px-[56px] xl:py-[80px]">
      <CategoryTag>Concorso pubblico farmacie</CategoryTag>

      <h1 className="max-w-2xl font-fredoka text-[30px] font-bold leading-[1.15] text-text-primary xl:text-[52px] xl:leading-[1.12]">
        La strada più veloce per vincere la farmacia.
      </h1>

      <p className="max-w-xl font-sans text-[15px] leading-[1.5] text-text-secondary xl:text-lg">
        3000 domande ufficiali. Le ricordi con la mnemotecnica, non le rileggi all&apos;infinito.
      </p>

      <div className="flex flex-col items-center gap-2">
        <ButtonPrimary href="/quiz" arrow>
          Prova il quiz gratis
        </ButtonPrimary>
        <span className="font-sans text-[13px] font-medium text-text-secondary">Nessuna registrazione richiesta</span>
      </div>

      <div className="flex flex-wrap justify-center gap-x-[28px] gap-y-3 pt-4">
        {TRUST_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="font-fredoka text-[20px] font-bold text-primary-dark xl:text-[26px]">{stat.value}</span>
            <span className="font-sans text-[12.5px] font-medium text-text-secondary">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
