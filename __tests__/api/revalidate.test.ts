import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { revalidateTag } from "next/cache";
import { POST } from "@/app/api/revalidate/route";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (read: () => Promise<unknown>) => read,
}));
vi.mock("@/lib/supabase/client", () => ({ getSupabaseClient: vi.fn() }));

const SECRET = "s3cret-di-prova";

function webhook(body: unknown, secret: string | null = SECRET) {
  return new Request("https://remindeer.test/api/revalidate", {
    method: "POST",
    headers: secret === null ? {} : { "x-revalidate-secret": secret },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const UPDATE = {
  type: "UPDATE",
  table: "page_contents",
  schema: "public",
  record: { slug: "home" },
  old_record: { slug: "home" },
};

beforeEach(() => {
  vi.stubEnv("REVALIDATE_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/revalidate", () => {
  describe("authorization", () => {
    test("rejects a request without the secret header", async () => {
      const response = await POST(webhook(UPDATE, null));

      expect(response.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    test.each([
      ["a wrong secret", "un-altro-segreto"],
      ["a prefix of the secret", SECRET.slice(0, -1)],
      ["an empty secret", ""],
    ])("rejects %s", async (_name, secret) => {
      const response = await POST(webhook(UPDATE, secret));

      expect(response.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    test.each([
      ["unset", undefined],
      ["empty", ""],
    ])("fails closed when REVALIDATE_SECRET is %s", async (_name, value) => {
      vi.stubEnv("REVALIDATE_SECRET", value);

      // The header values are what a careless comparison would turn the missing secret into.
      for (const header of ["undefined", "null", " "]) {
        const response = await POST(webhook(UPDATE, header));

        expect(response.status).toBe(401);
      }
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("checks the secret before reading the body", async () => {
      const response = await POST(webhook("not json", "un-altro-segreto"));

      expect(response.status).toBe(401);
    });
  });

  describe("authorized", () => {
    test("expires the tag of the changed page immediately", async () => {
      const response = await POST(webhook(UPDATE));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ revalidated: true, tags: ["page-content:home"] });
      expect(revalidateTag).toHaveBeenCalledWith("page-content:home", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("page-content-data:home", "max");
      expect(revalidateTag).toHaveBeenCalledTimes(2);
    });

    test("reads the slug from `old_record` on DELETE", async () => {
      const response = await POST(webhook({ ...UPDATE, type: "DELETE", record: null }));

      expect(response.status).toBe(200);
      expect(revalidateTag).toHaveBeenCalledWith("page-content:home", { expire: 0 });
    });

    test("revalidates both pages when the slug was renamed", async () => {
      const response = await POST(webhook({ ...UPDATE, record: { slug: "chi-siamo" }, old_record: { slug: "home" } }));

      await expect(response.json()).resolves.toEqual({
        revalidated: true,
        tags: ["page-content:chi-siamo", "page-content:home"],
      });
      expect(revalidateTag).toHaveBeenCalledWith("page-content:chi-siamo", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("page-content:home", { expire: 0 });
    });

    test("revalidates any slug, known page or not", async () => {
      const response = await POST(webhook({ ...UPDATE, type: "INSERT", record: { slug: "faq" }, old_record: null }));

      expect(response.status).toBe(200);
      expect(revalidateTag).toHaveBeenCalledWith("page-content:faq", { expire: 0 });
    });

    test.each([
      ["an unparseable body", "not json"],
      ["an empty body", ""],
      ["a body that is not an object", "[]"],
      ["no record at all", { type: "UPDATE" }],
      ["an empty slug", { record: { slug: "  " }, old_record: null }],
      ["a slug that is not a string", { record: { slug: 12 }, old_record: { slug: null } }],
      ["a slug too long for a cache tag", { record: { slug: "x".repeat(300) }, old_record: null }],
    ])("answers 400 to %s", async (_name, body) => {
      const response = await POST(webhook(body));

      expect(response.status).toBe(400);
      expect(revalidateTag).not.toHaveBeenCalled();
    });
  });
});
