"use client";

import { useActionState, useEffect, useState } from "react";
import { EmailCapture } from "@/components/ui/email-capture";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { submitEmailSignup } from "@/lib/actions/submitEmailSignup";
import { track } from "@/lib/analytics/track";

/**
 * Client island for the landing email signup (Story 1.5). Separate submission
 * path from the results-screen capture — same action and mailing list,
 * but its own `email_signup_landing` event.
 */
export function EmailSignupForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, formAction, isPending] = useActionState(submitEmailSignup, null);

  useEffect(() => {
    if (state?.ok) {
      track("email_signup_landing");
    }
  }, [state]);

  if (state?.ok) {
    return (
      <p role="status" className="font-sans text-[15px] text-text-primary">
        Grazie! Ti scriveremo al lancio.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="source" value="landing" />
      <input type="hidden" name="consent" value={consent ? "true" : "false"} />
      <EmailCapture email={email} onEmailChange={setEmail} consent={consent} onConsentChange={setConsent} />
      {state && !state.ok ? (
        <p role="alert" className="font-sans text-[13px] text-error">
          {state.error}
        </p>
      ) : null}
      <ButtonPrimary type="submit" variant="compact" disabled={isPending} className="self-start">
        {isPending ? "Invio..." : "Tienimi aggiornato"}
      </ButtonPrimary>
    </form>
  );
}
