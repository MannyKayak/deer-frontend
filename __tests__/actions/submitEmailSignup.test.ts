import { beforeEach, describe, expect, test, vi } from "vitest";
import { submitEmailSignup } from "@/lib/actions/submitEmailSignup";
import { insertEmailSignup } from "@/lib/data/emailSignup";
import { CONSENT_TEXT_VERSION } from "@/lib/consent";

vi.mock("@/lib/data/emailSignup", () => ({ insertEmailSignup: vi.fn() }));

const insertMock = vi.mocked(insertEmailSignup);

/** A submission from the landing form; `fields` override or add to it. */
function formData(fields: Record<string, string>) {
  const data = new FormData();
  data.set("source", "landing");
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

describe("submitEmailSignup", () => {
  beforeEach(() => {
    insertMock.mockResolvedValue(undefined);
  });

  test("inserts the trimmed, lowercased email with its consent proof", async () => {
    const result = await submitEmailSignup(null, formData({ email: "  Mario.Rossi@Esempio.IT ", consent: "true" }));

    expect(result).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledExactlyOnceWith({
      email: "mario.rossi@esempio.it",
      source: "landing",
      consentTextVersion: CONSENT_TEXT_VERSION,
    });
  });

  test("records the quiz as source for the post-quiz capture", async () => {
    await submitEmailSignup(null, formData({ email: "mario@esempio.it", consent: "true", source: "quiz" }));

    expect(insertMock).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ source: "quiz" }));
  });

  test("ignores a consent text version sent by the client", async () => {
    await submitEmailSignup(
      null,
      formData({ email: "mario@esempio.it", consent: "true", consent_text_version: "forged" }),
    );

    expect(insertMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ consentTextVersion: CONSENT_TEXT_VERSION }),
    );
  });

  test.each([
    ["missing", ""],
    ["unknown", "newsletter"],
  ])("writes nothing when the source is %s", async (_label, source) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const data = formData({ email: "mario@esempio.it", consent: "true" });
    if (source) data.set("source", source);
    else data.delete("source");

    const result = await submitEmailSignup(null, data);

    expect(result).toEqual({ ok: false, error: "Invio non riuscito. Riprova." });
    expect(insertMock).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test.each<[string, Record<string, string>]>([
    ["missing", {}],
    ["empty", { email: "" }],
    ["without domain", { email: "mario" }],
    ["without TLD", { email: "mario@esempio" }],
    ["with spaces", { email: "mario rossi@esempio.it" }],
    ["longer than 254 chars", { email: `${"a".repeat(250)}@esempio.it` }],
  ])("rejects an email %s without writing", async (_label, fields) => {
    const result = await submitEmailSignup(null, formData({ ...fields, consent: "true" }));

    expect(result).toEqual({ ok: false, error: "Inserisci un indirizzo email valido." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test.each<[string, Record<string, string>]>([
    ["missing", {}],
    ["false", { consent: "false" }],
    ["a checkbox default value", { consent: "on" }],
  ])("writes nothing when consent is %s", async (_label, fields) => {
    const result = await submitEmailSignup(null, formData({ email: "mario@esempio.it", ...fields }));

    expect(result).toEqual({ ok: false, error: "Serve il tuo consenso per iscriverti." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("returns a generic error instead of throwing when the insert fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    insertMock.mockRejectedValue(new Error("new row violates row-level security policy"));

    const result = await submitEmailSignup(null, formData({ email: "mario@esempio.it", consent: "true" }));

    expect(result).toEqual({ ok: false, error: "Invio non riuscito. Riprova." });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
