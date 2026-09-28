"use client";

import { useId, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailCaptureProps = {
  email: string;
  onEmailChange: (email: string) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
};

export function EmailCapture({ email, onEmailChange, consent, onConsentChange }: EmailCaptureProps) {
  const [touched, setTouched] = useState(false);
  const emailId = useId();
  const consentId = useId();
  const errorId = useId();

  const isInvalid = touched && email.length > 0 && !EMAIL_PATTERN.test(email);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={emailId} className="font-lexend text-[15px] font-semibold text-text-primary">
          Email <span className="font-sans text-[13px] font-normal text-text-secondary">(facoltativa)</span>
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
          placeholder="tu@esempio.it"
          className={`w-full rounded-sm border-2 bg-surface-raised px-[14px] py-[13px] font-sans text-[15px] text-text-primary outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary ${
            isInvalid ? "border-error" : "border-border-neutral"
          }`}
        />
        {isInvalid ? (
          <p id={errorId} className="font-sans text-[13px] text-error">
            Formato email non valido.
          </p>
        ) : null}
      </div>
      <label htmlFor={consentId} className="flex cursor-pointer items-start gap-2">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary-dark outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        />
        <span className="font-sans text-[13px] leading-[1.4] text-text-secondary">
          {/* [ASSUMPTION: placeholder consent copy pending legal text — see spec OQ-3, Iubenda step]. */}
          Acconsento a ricevere aggiornamenti sul lancio via email. Puoi ritirare il consenso in qualsiasi momento.
        </span>
      </label>
    </div>
  );
}
