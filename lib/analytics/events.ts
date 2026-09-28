export const ANALYTICS_EVENTS = [
  "visit_landing",
  "quiz_started",
  "quiz_completed",
  "quiz_feedback",
  "email_signup_landing",
  "email_signup_quiz",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
