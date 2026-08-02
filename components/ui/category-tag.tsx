export function CategoryTag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-primary-dark bg-qtag-bg px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.03em] text-primary-dark ${className}`}
    >
      {children}
    </span>
  );
}
