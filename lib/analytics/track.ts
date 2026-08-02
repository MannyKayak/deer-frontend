import type { AnalyticsEvent } from "./events";

/**
 * Provider-agnostic tracking call. Vendor (Plausible vs Umami, OQ-4) isn't
 * chosen yet, so this is a safe no-op in production until wired.
 */
export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}
