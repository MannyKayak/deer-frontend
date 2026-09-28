import { LogoMark } from "@/components/ui/logo-mark";
import { ButtonPrimary } from "@/components/ui/button-primary";

/** `showCta={false}` on `/quiz`: the CTA would reload the page and wipe progress. */
export function Header({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-neutral bg-surface-base/95 px-[22px] py-3 backdrop-blur xl:px-[56px]">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="font-fredoka text-[20px] font-semibold text-text-primary">Remindeer</span>
      </div>
      {showCta ? (
        <ButtonPrimary href="/quiz" variant="compact">
          Prova il quiz gratis
        </ButtonPrimary>
      ) : null}
    </header>
  );
}
