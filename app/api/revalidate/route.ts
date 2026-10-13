import { createHash, timingSafeEqual } from "node:crypto";
import { pageContentTag, revalidatePageContent } from "@/lib/data/pageContent";

const SECRET_HEADER = "x-revalidate-secret";
// A cache tag cannot exceed 256 characters; no real slug comes close.
const MAX_SLUG_LENGTH = 200;

/**
 * Called by the Supabase Database Webhook on `public.page_contents` (setup in
 * `.env.example`): expires the cached content of the page that changed, so
 * the next visit renders the new content.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get(SECRET_HEADER))) {
    return Response.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });
  }

  const slugs = await readSlugs(request);
  if (slugs.length === 0) {
    return Response.json({ revalidated: false, message: "Missing page slug" }, { status: 400 });
  }

  slugs.forEach(revalidatePageContent);
  return Response.json({ revalidated: true, tags: slugs.map(pageContentTag) });
}

/** Fails closed when `REVALIDATE_SECRET` is unset. Both sides are hashed so the comparison is constant-time. */
function isAuthorized(provided: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !provided) return false;
  return timingSafeEqual(sha256(provided), sha256(secret));
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * `record` is null on DELETE and `old_record` is null on INSERT, hence the
 * fallback. Both are returned when an UPDATE renamed the slug: the page of
 * the old slug has lost its content too.
 */
async function readSlugs(request: Request): Promise<string[]> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return [];
  }

  if (!isRecord(body)) return [];
  const slugs = [slugOf(body.record), slugOf(body.old_record)].filter((slug) => slug !== null);
  return [...new Set(slugs)];
}

function slugOf(record: unknown): string | null {
  if (!isRecord(record) || typeof record.slug !== "string") return null;
  const slug = record.slug.trim();
  return slug !== "" && slug.length <= MAX_SLUG_LENGTH ? slug : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
