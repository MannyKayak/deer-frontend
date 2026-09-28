import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "full" | "compact";

type SharedProps = {
  variant?: Variant;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

type LinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

/**
 * Aquamarine CTA with ink border + offset ink shadow (DESIGN.md button-primary,
 * 2026-09-27 revision). Full variant carries the arrow (hero/quiz); compact variant
 * (sticky header) never does. Also the in-quiz "Avanti"/"Vedi i risultati" and
 * results "Ritenta"/"Invia" buttons — kept generic (label/variant/arrow).
 */
export function ButtonPrimary(props: LinkProps | ButtonProps) {
  const { variant = "full", arrow = false, children, className = "" } = props;

  const sizeClasses =
    variant === "compact"
      ? "px-[22px] py-[12px] text-sm shadow-[4px_4px_0_var(--color-text-primary)]"
      : "px-[30px] py-[18px] text-[17px] shadow-[5px_5px_0_var(--color-text-primary)]";

  const sharedClasses = `inline-flex items-center justify-center gap-2 rounded-md border-2 border-text-primary bg-primary font-fredoka font-semibold text-on-primary outline-hidden transition-transform hover:-translate-y-0.5 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${sizeClasses} ${className}`;

  const content = (
    <>
      {children}
      {arrow ? <span aria-hidden="true">→</span> : null}
    </>
  );

  if (props.href) {
    const anchorProps = props as LinkProps;
    return (
      <a href={anchorProps.href} className={sharedClasses} target={anchorProps.target} rel={anchorProps.rel}>
        {content}
      </a>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={sharedClasses}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
    >
      {content}
    </button>
  );
}
