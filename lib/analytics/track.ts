import type { AnalyticsEvent } from "./events";

/**
 * Provider-agnostic tracking call. Vendor is Umami Cloud (spec OQ-4), not yet
 * wired (needs the PO account), so this is a safe no-op in production until wired.
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
