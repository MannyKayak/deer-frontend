import type { ReactNode } from "react";

/**
 * Plain wrapper — no comparison-specific styling. Reused unchanged for
 * the static landing preview (Story 1.4) and the real quiz (Epic 2).
 */
export function QuizCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border-[3px] border-text-primary bg-surface-raised p-[22px] shadow-[7px_7px_0_var(--color-text-primary)] ${className}`}
    >
      {children}
    </div>
  );
}
