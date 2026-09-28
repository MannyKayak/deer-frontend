import type { ReactNode } from "react";
import { ContentImage } from "@/components/ui/content-image";

/** Every mnemonic has text, an image, or both — render whichever exists. */
export function MnemoBox({ children, imageUrl }: { children?: ReactNode; imageUrl?: string | null }) {
  return (
    <div className="rounded-sm border-2 border-accent-gold bg-mnemo-bg p-4">
      <span className="block font-sans text-[11px] font-bold uppercase tracking-[0.03em] text-text-primary">
        🔑 Mnemotecnica
      </span>
      {children ? (
        <p className="mt-1 font-sans text-[13.5px] font-medium leading-[1.5] text-text-primary">
          {children}
        </p>
      ) : null}
      {imageUrl ? <ContentImage src={imageUrl} alt="Immagine della mnemotecnica" className="mt-2" /> : null}
    </div>
  );
}
