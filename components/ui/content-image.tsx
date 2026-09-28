/**
 * Image from the private `question-images` bucket via a short-lived signed URL.
 * Plain <img>: signed URLs carry an auth token and unknown dimensions, so
 * next/image optimization doesn't apply. Callers render nothing when the URL is null.
 */
export function ContentImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`h-auto max-w-full rounded-sm border-2 border-border-neutral ${className}`} />;
}
