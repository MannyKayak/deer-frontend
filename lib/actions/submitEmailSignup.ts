"use server";

import "server-only";
import { z } from "zod";
import { CONSENT_TEXT_VERSION, SIGNUP_SOURCES } from "@/lib/consent";
import { insertEmailSignup } from "@/lib/data/emailSignup";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
const sourceSchema = z.enum(SIGNUP_SOURCES);

export type SubmitEmailSignupState = { ok: true } | { ok: false; error: string } | null;

/**
 * Mailing-list signup, shared by the landing section (CAP-13) and the
 * post-quiz capture (CAP-10). Missing consent means no write at all; a write
 * always carries the consent proof (source form + consent text version).
 * Called via `useActionState`, never throws.
 */
export async function submitEmailSignup(
  _prevState: SubmitEmailSignupState,
  formData: FormData,
): Promise<SubmitEmailSignupState> {
  const email = emailSchema.safeParse(formData.get("email") ?? "");
  if (!email.success) {
    return { ok: false, error: "Inserisci un indirizzo email valido." };
  }

  const consent = formData.get("consent") === "true";
  if (!consent) {
    return { ok: false, error: "Serve il tuo consenso per iscriverti." };
  }

  // Set by the form itself, never by the visitor: a bad value is a broken client.
  const source = sourceSchema.safeParse(formData.get("source"));
  if (!source.success) {
    console.error("[submitEmailSignup] missing or unknown source");
    return { ok: false, error: "Invio non riuscito. Riprova." };
  }

  try {
    await insertEmailSignup({ email: email.data, source: source.data, consentTextVersion: CONSENT_TEXT_VERSION });
  } catch (error) {
    console.error("[submitEmailSignup] insert failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "Invio non riuscito. Riprova." };
  }

  return { ok: true };
}
