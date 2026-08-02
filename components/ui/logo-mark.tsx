/**
 * Placeholder logo (OQ-2: final logo not yet delivered). Always paired
 * with the wordmark text, never standalone.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-text-primary bg-primary ${className}`}
    >
      <span className="absolute -top-1 left-1 h-2 w-2 rotate-[-25deg] rounded-[2px] border-2 border-text-primary bg-primary" />
      <span className="absolute -top-1 right-1 h-2 w-2 rotate-[25deg] rounded-[2px] border-2 border-text-primary bg-primary" />
    </span>
  );
}
