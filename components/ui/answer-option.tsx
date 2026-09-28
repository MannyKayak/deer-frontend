type AnswerOptionProps = {
  children: React.ReactNode;
  state?: "default" | "selected" | "correct" | "incorrect";
  onClick?: () => void;
  disabled?: boolean;
};

export function AnswerOption({ children, state = "default", onClick, disabled = false }: AnswerOptionProps) {
  const stateClasses =
    state === "correct"
      ? "border-correct bg-correct-bg font-bold text-text-primary shadow-[5px_5px_0_var(--color-correct)]"
      : state === "incorrect"
        ? "border-error bg-error/10 font-bold text-text-primary shadow-[5px_5px_0_var(--color-error)]"
        : state === "selected"
          ? "border-primary bg-primary/10 font-bold text-text-primary"
          : "border-border-neutral bg-surface-raised font-medium text-text-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-sm border-2 px-[14px] py-[13px] text-left font-sans text-[15px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary disabled:cursor-default ${stateClasses}`}
    >
      {state === "correct" ? <span aria-hidden="true">✓ </span> : null}
      {state === "incorrect" ? <span aria-hidden="true">✗ </span> : null}
      {children}
    </button>
  );
}
