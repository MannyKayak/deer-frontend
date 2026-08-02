"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import type { AnalyticsEvent } from "@/lib/analytics/events";

/**
 * Non-visual event trigger. Fires once on mount. Kept outside
 * components/landing to let that tree stay Server-Component-only (AD-8).
 */
export function PageViewTracker({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
  }, [event]);

  return null;
}
