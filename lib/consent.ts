/**
 * Marketing-consent copy shown next to every email capture, and the version
 * stored with each signup as consent proof. Bump the version whenever the text
 * changes, so a stored signup always points at the exact wording accepted.
 * [ASSUMPTION: placeholder consent copy pending legal text — see spec OQ-3, Iubenda step].
 */
export const CONSENT_TEXT_VERSION = "2026-10-placeholder";

export const CONSENT_TEXT =
  "Acconsento a ricevere aggiornamenti sul lancio via email. Puoi ritirare il consenso in qualsiasi momento.";

/** Which form collected the signup. Must match the `email_signups.source` check in the backoffice schema. */
export const SIGNUP_SOURCES = ["landing", "quiz"] as const;

export type SignupSource = (typeof SIGNUP_SOURCES)[number];
