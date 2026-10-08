import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailSignupForm } from "@/components/landing/email-signup-form";
import { insertEmailSignup } from "@/lib/data/emailSignup";
import { track } from "@/lib/analytics/track";
import { CONSENT_TEXT, CONSENT_TEXT_VERSION } from "@/lib/consent";

// The real server action runs; only the Supabase write and analytics are mocked.
vi.mock("@/lib/data/emailSignup", () => ({ insertEmailSignup: vi.fn() }));
vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));

const insertMock = vi.mocked(insertEmailSignup);
const trackMock = vi.mocked(track);

const emailInput = () => screen.getByRole("textbox", { name: /email/i });
const consentCheckbox = () => screen.getByRole("checkbox", { name: /acconsento/i });
const submitButton = () => screen.getByRole("button", { name: "Tienimi aggiornato" });

describe("landing email signup", () => {
  beforeEach(() => {
    insertMock.mockResolvedValue(undefined);
  });

  test("signs up with email and consent, then shows the thank-you message", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.type(emailInput(), "Mario.Rossi@Esempio.it");
    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByRole("status")).toHaveProperty("textContent", "Grazie! Ti scriveremo al lancio.");
    expect(insertMock).toHaveBeenCalledExactlyOnceWith({
      email: "mario.rossi@esempio.it",
      source: "landing",
      consentTextVersion: CONSENT_TEXT_VERSION,
    });
    expect(trackMock).toHaveBeenCalledExactlyOnceWith("email_signup_landing");
    expect(screen.queryByRole("button", { name: "Tienimi aggiornato" })).toBeNull();
  });

  test("the checkbox is labelled with the versioned consent text", () => {
    render(<EmailSignupForm />);

    expect(screen.getByRole("checkbox", { name: CONSENT_TEXT })).toBeDefined();
  });

  test("without consent nothing is written and the form asks for it", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.type(emailInput(), "mario@esempio.it");
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Serve il tuo consenso per iscriverti.");
    expect(insertMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
  });

  test("unchecking the consent again withholds the signup", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.type(emailInput(), "mario@esempio.it");
    await user.click(consentCheckbox());
    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Serve il tuo consenso per iscriverti.");
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("an empty email is rejected even with consent", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Inserisci un indirizzo email valido.");
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("an email the server considers malformed is rejected", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    // Passes the browser type=email check, fails the server schema (no TLD).
    await user.type(emailInput(), "mario@esempio");
    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Inserisci un indirizzo email valido.");
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("a failed write keeps the filled form so the visitor can retry", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    insertMock.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.type(emailInput(), "mario@esempio.it");
    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Invio non riuscito. Riprova.");
    expect(trackMock).not.toHaveBeenCalled();
    expect(emailInput()).toHaveProperty("value", "mario@esempio.it");

    await user.click(submitButton());

    expect(await screen.findByRole("status")).toHaveProperty("textContent", "Grazie! Ti scriveremo al lancio.");
    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(trackMock).toHaveBeenCalledExactlyOnceWith("email_signup_landing");
    consoleError.mockRestore();
  });

  // Known bug (reproduced in Chrome): React resets the form after the action, so the
  // checkbox shows unchecked while the hidden `consent` input still submits "true".
  // Drop `.fails` once the checkbox and the submitted consent can no longer disagree.
  test.fails("a rejected submit leaves the consent checkbox as the visitor set it", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.type(emailInput(), "mario@esempio");
    await user.click(consentCheckbox());
    await user.click(submitButton());
    await screen.findByRole("alert");

    expect(consentCheckbox()).toHaveProperty("checked", true);
  });

  test("flags a malformed email inline once the field loses focus", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm />);

    await user.type(emailInput(), "mario");
    await user.tab();

    expect(screen.getByText("Formato email non valido.")).toBeDefined();
    expect(emailInput().getAttribute("aria-invalid")).toBe("true");
  });
});
