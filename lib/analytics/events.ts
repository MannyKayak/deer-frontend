export const ANALYTICS_EVENTS = [
  "visit_landing",
  "quiz_started",
  "quiz_completed",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
