"use server";

import "server-only";
import { z } from "zod";
import { insertEmailSignup } from "@/lib/data/emailSignup";

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
});

export type SubmitEmailSignupState = { ok: true } | { ok: false; error: string } | null;

/**
 * Mailing-list signup, shared by the landing section (CAP-13) and the
 * post-quiz capture (CAP-10). Missing consent means no write at all.
 * Called via `useActionState`, never throws.
 */
export async function submitEmailSignup(
  _prevState: SubmitEmailSignupState,
  formData: FormData,
): Promise<SubmitEmailSignupState> {
  const parsed = inputSchema.safeParse({
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: "Inserisci un indirizzo email valido." };
  }

  const consent = formData.get("consent") === "true";
  if (!consent) {
    return { ok: false, error: "Serve il tuo consenso per iscriverti." };
  }

  try {
    await insertEmailSignup(parsed.data.email);
  } catch (error) {
    console.error("[submitEmailSignup] insert failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "Invio non riuscito. Riprova." };
  }

  return { ok: true };
}
