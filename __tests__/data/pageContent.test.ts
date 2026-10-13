import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { revalidateTag } from "next/cache";
import {
  DEFAULT_HOME_CONTENT,
  getHomeContent,
  pageContentTag,
  parseHomeContent,
  revalidatePageContent,
} from "@/lib/data/pageContent";
import { getSupabaseClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({ getSupabaseClient: vi.fn() }));
// The cache is Next.js' business: here the cached read runs on every call.
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (read: () => Promise<unknown>) => read,
}));

const SUPABASE_URL = "https://project.supabase.co";

const ADMIN_CONTENT = {
  title: "Titolo dal backoffice",
  subtitle: "Sottotitolo dal backoffice",
  cta: { label: "Inizia ora", note: "Gratis per sempre" },
  stats: [
    { value: "10", label: "domande di prova" },
    { value: "5 min", label: "per finire" },
  ],
  hero_image: { path: "a1b2c3.png", alt: "Un cervo che studia" },
  updated_at: "2026-10-13T10:00:00Z",
};

/** Makes the next `rpc(...)` resolve with `result`; returns the spy. */
function mockRpc(result: { data: unknown; error: { code: string; message: string } | null }) {
  const rpc = vi.fn().mockResolvedValue(result);
  vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as unknown as ReturnType<typeof getSupabaseClient>);
  return rpc;
}

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", SUPABASE_URL);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("parseHomeContent", () => {
  test("keeps every field authored in the backoffice", () => {
    expect(parseHomeContent(ADMIN_CONTENT)).toEqual({
      title: "Titolo dal backoffice",
      subtitle: "Sottotitolo dal backoffice",
      cta: { label: "Inizia ora", note: "Gratis per sempre" },
      stats: [
        { value: "10", label: "domande di prova" },
        { value: "5 min", label: "per finire" },
      ],
      image: {
        src: `${SUPABASE_URL}/storage/v1/object/public/page-images/a1b2c3.png`,
        alt: "Un cervo che studia",
        remote: true,
      },
    });
  });

  test.each([
    ["null", null],
    ["a string", '{"title":"x"}'],
    ["a number", 42],
    ["an array", [ADMIN_CONTENT]],
    ["undefined", undefined],
  ])("gives the defaults when the result is %s", (_name, raw) => {
    expect(parseHomeContent(raw)).toEqual(DEFAULT_HOME_CONTENT);
  });

  test("gives the defaults for an empty object", () => {
    expect(parseHomeContent({})).toEqual(DEFAULT_HOME_CONTENT);
  });

  test("replaces only the missing or empty fields, keeping the valid ones", () => {
    const content = parseHomeContent({
      title: "   ",
      subtitle: "Sottotitolo dal backoffice",
      cta: { label: 7, note: "Gratis per sempre" },
    });

    expect(content.title).toBe(DEFAULT_HOME_CONTENT.title);
    expect(content.subtitle).toBe("Sottotitolo dal backoffice");
    expect(content.cta).toEqual({ label: DEFAULT_HOME_CONTENT.cta.label, note: "Gratis per sempre" });
  });

  test("falls back to the default CTA when `cta` is not an object", () => {
    expect(parseHomeContent({ ...ADMIN_CONTENT, cta: "Inizia ora" }).cta).toEqual(DEFAULT_HOME_CONTENT.cta);
  });

  describe("stats", () => {
    test.each([
      ["missing", undefined],
      ["null", null],
      ["an object", { value: "1", label: "uno" }],
    ])("uses the default stats when `stats` is %s", (_name, stats) => {
      expect(parseHomeContent({ ...ADMIN_CONTENT, stats }).stats).toEqual(DEFAULT_HOME_CONTENT.stats);
    });

    test("an explicit empty list means no stats at all", () => {
      expect(parseHomeContent({ ...ADMIN_CONTENT, stats: [] }).stats).toEqual([]);
    });

    test("drops the entries lacking a value or a label", () => {
      const stats = [
        { value: "1", label: "valida" },
        { value: "", label: "senza valore" },
        { value: "3" },
        { value: 4, label: "valore numerico" },
        "non un oggetto",
        null,
        { value: "2", label: "valida anche questa" },
      ];

      expect(parseHomeContent({ ...ADMIN_CONTENT, stats }).stats).toEqual([
        { value: "1", label: "valida" },
        { value: "2", label: "valida anche questa" },
      ]);
    });

    test("keeps the first four valid entries", () => {
      const stats = Array.from({ length: 6 }, (_, index) => ({ value: String(index + 1), label: `stat ${index + 1}` }));

      expect(parseHomeContent({ ...ADMIN_CONTENT, stats }).stats).toEqual(stats.slice(0, 4));
    });
  });

  describe("hero image", () => {
    test.each([
      ["null", null],
      ["missing", undefined],
      ["without a path", { alt: "Un cervo che studia" }],
      ["with an empty path", { path: "  ", alt: "Un cervo che studia" }],
      ["with a path that leaves the bucket", { path: "../secret.png", alt: "Un cervo che studia" }],
    ])("renders the mascot with its own alt when `hero_image` is %s", (_name, hero_image) => {
      expect(parseHomeContent({ ...ADMIN_CONTENT, hero_image }).image).toEqual(DEFAULT_HOME_CONTENT.image);
    });

    test.each([
      ["missing", undefined],
      ["empty", "   "],
      ["not a string", 12],
    ])("a remote image whose alt is %s is decorative, never described as the mascot", (_name, alt) => {
      const { image } = parseHomeContent({ ...ADMIN_CONTENT, hero_image: { path: "a1b2c3.png", alt } });

      expect(image).toEqual({
        src: `${SUPABASE_URL}/storage/v1/object/public/page-images/a1b2c3.png`,
        alt: "",
        remote: true,
      });
    });

    test("builds the public URL from a nested path, encoding each segment", () => {
      const { image } = parseHomeContent({ ...ADMIN_CONTENT, hero_image: { path: "home/hero image.png" } });

      expect(image.src).toBe(`${SUPABASE_URL}/storage/v1/object/public/page-images/home/hero%20image.png`);
    });

    test("renders the mascot when the Supabase URL is unknown", () => {
      vi.stubEnv("SUPABASE_URL", "");

      expect(parseHomeContent(ADMIN_CONTENT).image).toEqual(DEFAULT_HOME_CONTENT.image);
    });
  });
});

describe("getHomeContent", () => {
  test("reads the home content through the RPC", async () => {
    const rpc = mockRpc({ data: ADMIN_CONTENT, error: null });

    const content = await getHomeContent();

    expect(rpc).toHaveBeenCalledExactlyOnceWith("get_page_content", { p_slug: "home" });
    expect(content.title).toBe("Titolo dal backoffice");
    expect(content.stats).toHaveLength(2);
  });

  test("a missing row is a valid answer: defaults, logged as a warning", async () => {
    mockRpc({ data: null, error: null });

    await expect(getHomeContent()).resolves.toEqual(DEFAULT_HOME_CONTENT);
    expect(console.warn).toHaveBeenCalledOnce();
    expect(console.error).not.toHaveBeenCalled();
  });

  test("a result that is not an object gives the defaults, with its own warning", async () => {
    mockRpc({ data: '{"title":"x"}', error: null });

    await expect(getHomeContent()).resolves.toEqual(DEFAULT_HOME_CONTENT);
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(expect.stringContaining("not an object"));
  });

  describe("when the read fails with nothing cached", () => {
    test("an RPC error gives the defaults and is logged as an error", async () => {
      mockRpc({
        data: null,
        error: { code: "PGRST202", message: "Could not find the function public.get_page_content" },
      });

      await expect(getHomeContent()).resolves.toEqual(DEFAULT_HOME_CONTENT);
      expect(console.error).toHaveBeenCalledOnce();
      expect(console.warn).not.toHaveBeenCalled();
    });

    test("a rejected call is handled like an RPC error", async () => {
      const rpc = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
      vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as unknown as ReturnType<typeof getSupabaseClient>);

      await expect(getHomeContent()).resolves.toEqual(DEFAULT_HOME_CONTENT);
      expect(console.error).toHaveBeenCalledOnce();
    });

    test("an exception from the client is handled like an RPC error", async () => {
      vi.mocked(getSupabaseClient).mockImplementation(() => {
        throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in server env");
      });

      await expect(getHomeContent()).resolves.toEqual(DEFAULT_HOME_CONTENT);
      expect(console.error).toHaveBeenCalledOnce();
    });
  });
});

describe("revalidatePageContent", () => {
  test("expires the page at once and only marks the data stale, so the last good content survives", () => {
    revalidatePageContent("home");

    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith("page-content:home", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("page-content-data:home", "max");
  });
});

describe("pageContentTag", () => {
  test("is the per-slug tag the webhook revalidates", () => {
    expect(pageContentTag("home")).toBe("page-content:home");
  });
});
