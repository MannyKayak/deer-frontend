import { LogoMark } from "@/components/ui/logo-mark";
import { ButtonPrimary } from "@/components/ui/button-primary";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-neutral bg-surface-base/95 px-[22px] py-3 backdrop-blur xl:px-[56px]">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="font-lexend text-lg font-semibold text-text-primary">
          Deer
        </span>
      </div>
      <ButtonPrimary href="#quiz" variant="compact">
        Prova 10 domande gratis
      </ButtonPrimary>
    </header>
  );
}
