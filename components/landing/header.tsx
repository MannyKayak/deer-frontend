import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import { ButtonPrimary } from "@/components/ui/button-primary";

/** `showCta={false}` on `/quiz`: the CTA would reload the page and wipe progress. */
export function Header({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-neutral bg-surface-base/95 px-[22px] py-3 backdrop-blur xl:px-[56px]">
      <div className="mx-auto flex max-w-page items-center justify-between">
        <Link
          href="/"
          aria-label="Remindeer, torna alla home"
          className="flex items-center gap-2 rounded-sm md:gap-3 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
        >
          <LogoMark />
          <span className="font-fredoka text-[20px] font-semibold text-text-primary md:text-[28px]">Remindeer</span>
        </Link>
        {showCta ? (
          <ButtonPrimary href="/quiz" variant="header">
            Prova il quiz gratis
          </ButtonPrimary>
        ) : null}
      </div>
    </header>
  );
}
