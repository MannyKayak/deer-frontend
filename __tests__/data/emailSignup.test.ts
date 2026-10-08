import { describe, expect, test, vi } from "vitest";
import { insertEmailSignup } from "@/lib/data/emailSignup";
import { getSupabaseClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({ getSupabaseClient: vi.fn() }));

const SIGNUP = { email: "mario@esempio.it", source: "landing", consentTextVersion: "v-test" } as const;

/** Makes the next `from(...).insert(...)` resolve with `error`; returns the spies. */
function mockInsert(error: { code: string; message: string } | null) {
  const insert = vi.fn().mockResolvedValue({ error });
  const from = vi.fn().mockReturnValue({ insert });
  vi.mocked(getSupabaseClient).mockReturnValue({ from } as unknown as ReturnType<typeof getSupabaseClient>);
  return { from, insert };
}

describe("insertEmailSignup", () => {
  test("writes the email with its consent proof and leaves the timestamp to the database", async () => {
    const { from, insert } = mockInsert(null);

    await insertEmailSignup(SIGNUP);

    expect(from).toHaveBeenCalledExactlyOnceWith("email_signups");
    expect(insert).toHaveBeenCalledExactlyOnceWith({
      email: "mario@esempio.it",
      source: "landing",
      consent_text_version: "v-test",
    });
  });

  test("treats an email already on the list as a success", async () => {
    mockInsert({ code: "23505", message: "duplicate key value violates unique constraint" });

    await expect(insertEmailSignup(SIGNUP)).resolves.toBeUndefined();
  });

  test("throws on any other database error", async () => {
    mockInsert({ code: "42501", message: "new row violates row-level security policy" });

    await expect(insertEmailSignup(SIGNUP)).rejects.toThrow("row-level security");
  });
});
