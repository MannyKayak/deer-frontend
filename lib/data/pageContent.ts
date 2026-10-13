import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { HomeContent, HomeStat } from "./types";

const IMAGE_BUCKET = "page-images";
const HOME_SLUG = "home";
const REVALIDATE_SECONDS = 3600;
const RETRY_SECONDS = 60;
const MAX_STATS = 4;

/**
 * Tag carried by the page that shows a slug's content. The webhook expires it
 * at once, so the first visit after an edit renders the page again.
 */
export function pageContentTag(slug: string): string {
  return `page-content:${slug}`;
}

/**
 * Tag of the cached RPC result. The webhook only marks it stale: a stale
 * entry is re-read on the next render, but it is still there to fall back on
 * if that read fails. An expired entry would be gone.
 */
function pageContentDataTag(slug: string): string {
  return `page-content-data:${slug}`;
}

/**
 * Makes the public site pick up a content change for `slug`. Call it outside
 * of rendering (route handler).
 */
export function revalidatePageContent(slug: string): void {
  revalidateTag(pageContentDataTag(slug), "max");
  revalidateTag(pageContentTag(slug), { expire: 0 });
}

/** The hero as it was before the backoffice could edit it. */
export const DEFAULT_HOME_CONTENT: HomeContent = {
  title: "La strada più veloce per vincere la farmacia.",
  subtitle: "3000 domande ufficiali. Le ricordi con la mnemotecnica, non le rileggi all'infinito.",
  cta: { label: "Prova il quiz gratis", note: "Nessuna registrazione richiesta" },
  stats: [
    { value: "3000", label: "domande ufficiali" },
    { value: "2 min", label: "per il quiz gratuito" },
    { value: "0", label: "login richiesti" },
  ],
  image: {
    src: "/image/hero-deer-lab.png",
    alt: "Il cervo Remindeer in camice da laboratorio prepara delle microcapsule al banco, tra becher, provette e microscopio.",
    remote: false,
  },
};

/**
 * Caches nothing useful: it exists to put the page tag on every page that
 * calls it, separately from the tag of the data (see `pageContentDataTag`).
 */
const tagHomePage = unstable_cache(async () => null, ["page-content-tag", HOME_SLUG], {
  tags: [pageContentTag(HOME_SLUG)],
});

/**
 * Caches nothing useful either: a page takes the shortest revalidation among
 * the cached functions it calls, so calling this one makes the page that is
 * being rendered expire in a minute instead of an hour.
 */
const retryPageSoon = unstable_cache(async () => null, ["page-content-retry", HOME_SLUG], {
  revalidate: RETRY_SECONDS,
});

/**
 * Hero content of the home page, authored in the backoffice. Always complete:
 * see `parseHomeContent` for the per-field fallback.
 *
 * The raw RPC result is cached for an hour. The read throws on failure so
 * that a failure is never stored: `null` (no row for the slug) is a valid
 * answer and is cached like any other. When a stale entry cannot be
 * refreshed, `unstable_cache` logs the error and keeps returning the entry —
 * that is what makes the last good content survive a failed read. With
 * nothing cached the error reaches us and the defaults are rendered. In both
 * cases the page is retried after a minute rather than kept for the hour.
 */
export async function getHomeContent(): Promise<HomeContent> {
  let readFailed = false;
  // Defined per call only to capture `readFailed`; the cache key is the same every time.
  const readHomeContent = unstable_cache(
    async (): Promise<unknown> => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.rpc("get_page_content", { p_slug: HOME_SLUG });

        if (error) {
          throw new Error(error.message);
        }
        return data ?? null;
      } catch (error) {
        readFailed = true;
        throw error;
      }
    },
    ["page-content", HOME_SLUG],
    { tags: [pageContentDataTag(HOME_SLUG)], revalidate: REVALIDATE_SECONDS },
  );

  let raw: unknown;
  let cached = true;
  try {
    await tagHomePage();
    raw = await readHomeContent();
  } catch (error) {
    console.error("[getHomeContent] read failed:", error instanceof Error ? error.message : error);
    cached = false;
  }

  if (readFailed) {
    await retryPageSoon().catch(() => null);
  }
  if (!cached) return DEFAULT_HOME_CONTENT;

  if (raw === null) {
    console.warn("[getHomeContent] no content row for the home page, rendering the defaults");
  } else if (!isRecord(raw)) {
    console.warn("[getHomeContent] the home page content is not an object, rendering the defaults");
  }
  return parseHomeContent(raw);
}

/**
 * Turns the untrusted RPC result into complete content. Anything that is not
 * a plain object gives the defaults; otherwise each missing or empty field
 * falls back to its own default and the valid ones are kept.
 */
export function parseHomeContent(raw: unknown): HomeContent {
  if (!isRecord(raw)) return DEFAULT_HOME_CONTENT;

  const cta = isRecord(raw.cta) ? raw.cta : {};
  return {
    title: nonEmpty(raw.title) ?? DEFAULT_HOME_CONTENT.title,
    subtitle: nonEmpty(raw.subtitle) ?? DEFAULT_HOME_CONTENT.subtitle,
    cta: {
      label: nonEmpty(cta.label) ?? DEFAULT_HOME_CONTENT.cta.label,
      note: nonEmpty(cta.note) ?? DEFAULT_HOME_CONTENT.cta.note,
    },
    stats: parseStats(raw.stats),
    image: parseImage(raw.hero_image),
  };
}

/** An explicit `[]` is valid (no stats row); invalid entries are dropped before the cap. */
function parseStats(raw: unknown): HomeStat[] {
  if (!Array.isArray(raw)) return DEFAULT_HOME_CONTENT.stats;

  return raw
    .flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const value = nonEmpty(entry.value);
      const label = nonEmpty(entry.label);
      return value && label ? [{ value, label }] : [];
    })
    .slice(0, MAX_STATS);
}

/**
 * A remote image never inherits the mascot's alt: without a description of
 * its own it is rendered as decorative.
 */
function parseImage(raw: unknown): HomeContent["image"] {
  const src = isRecord(raw) ? pageImageUrl(raw.path) : null;
  if (!isRecord(raw) || !src) return DEFAULT_HOME_CONTENT.image;

  return { src, alt: nonEmpty(raw.alt) ?? "", remote: true };
}

/** Public URL of an object in the `page-images` bucket; never signed, so it can live in a cached page. */
function pageImageUrl(path: unknown): string | null {
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const segments = nonEmpty(path)?.trim().split("/").filter(Boolean);
  if (!base || !segments?.length || segments.some((segment) => segment === "." || segment === "..")) {
    return null;
  }
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/${segments.map(encodeURIComponent).join("/")}`;
}

/** The value when it is a string with at least one non-whitespace character. */
function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
