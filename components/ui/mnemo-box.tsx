import type { ReactNode } from "react";

export function MnemoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm border-2 border-accent-gold bg-mnemo-bg p-4">
      <span className="block font-sans text-[11px] font-bold uppercase tracking-[0.03em] text-text-primary">
        🔑 Mnemotecnica
      </span>
      <p className="mt-1 font-sans text-[13.5px] font-medium leading-[1.5] text-text-primary">
        {children}
      </p>
    </div>
  );
}
