import Image from "next/image";

/** Brand mark. Always paired with the wordmark text, never standalone. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/image/logo.png"
      alt=""
      aria-hidden="true"
      width={1302}
      height={1208}
      loading="eager"
      className={`h-8 w-auto shrink-0 md:h-12 ${className}`}
    />
  );
}
