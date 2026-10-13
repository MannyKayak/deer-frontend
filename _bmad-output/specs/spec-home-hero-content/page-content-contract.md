# Page Content Contract

Provided by `remindeer-backoffice`. This repo reads it; it never creates or alters the objects behind it.

## Read

`supabase.rpc("get_page_content", { p_slug: "home" })`, as anon with the publishable key. Returns one JSON object, or `null` when the slug does not exist.

```json
{
  "title": "La strada più veloce per vincere la farmacia.",
  "subtitle": "3000 domande ufficiali. Le ricordi con la mnemotecnica, non le rileggi all'infinito.",
  "cta": { "label": "Prova il quiz gratis", "note": "Nessuna registrazione richiesta" },
  "stats": [
    { "value": "3000", "label": "domande ufficiali" },
    { "value": "2 min", "label": "per il quiz gratuito" },
    { "value": "0", "label": "login richiesti" }
  ],
  "hero_image": { "path": "a1b2c3.png", "alt": "Il cervo Remindeer in camice…" },
  "updated_at": "2026-10-13T10:00:00Z"
}
```

- `stats`: 0 to 4 entries.
- `hero_image`: `null` when the admin has not chosen an image.
- `hero_image.path`: object path in the public Storage bucket `page-images`. URL = `${SUPABASE_URL}/storage/v1/object/public/page-images/${path}`. Public on purpose; never signed. The backoffice generates a new path on every upload and never overwrites an object, so the URL changes whenever the image does.

Status 2026-10-13: not deployed — the call returns `404 PGRST202`.

## Default content

The values above are the defaults, except the image: the default is the static file `/image/hero-deer-lab.png` (1213×1217) with alt "Il cervo Remindeer in camice da laboratorio prepara delle microcapsule al banco, tra becher, provette e microscopio."

## Validation and fallback

Two kinds of failure, treated differently (decided 2026-10-13):

| Case | Rendered | Cached |
| --- | --- | --- |
| Read fails (RPC error, network, exception), good content already cached | last good content | cache left untouched, read retried |
| Read fails, nothing ever cached (first build, RPC not deployed) | defaults | failure not stored |
| `null`, or a result that is not a plain object | defaults | yes |
| Object with invalid fields | per-field rules below | yes |

Every failure is logged on the server.

| Field | Valid when | Otherwise |
| --- | --- | --- |
| `title` | non-empty string | default title |
| `subtitle` | non-empty string | default subtitle |
| `cta.label` | non-empty string | default label |
| `cta.note` | non-empty string | default note |
| `stats` | array | default stats |
| `stats[]` entry | non-empty `value` and `label` | entry dropped |
| `stats` length | ≤ 4 | first 4 kept |
| `stats` = `[]` | valid | no stats row rendered |
| `hero_image` | object with non-empty `path` | static mascot + default alt |
| `hero_image.alt` | non-empty string | empty alt (decorative); mascot alt never reused |
| `updated_at` | — | ignored |

"Non-empty" = a string with at least one non-whitespace character. Rows marked as interpretation in SPEC.md Assumptions are not in the brief.

## Revalidation webhook

Supabase Database Webhook → `POST {site origin}/api/revalidate`.

- Table `public.page_contents`; events INSERT, UPDATE, DELETE.
- Header `x-revalidate-secret: <REVALIDATE_SECRET>`.
- Body:

```json
{ "type": "UPDATE", "table": "page_contents", "schema": "public", "record": { "slug": "home" }, "old_record": { "slug": "home" } }
```

`record` is `null` on DELETE, `old_record` is `null` on INSERT — hence slug = `record.slug`, else `old_record.slug`.

| Request | Response |
| --- | --- |
| Header missing, wrong, or `REVALIDATE_SECRET` unset | 401, nothing revalidated |
| Authorized, no usable slug or unparseable body | 400 |
| Authorized, slug present | 200, tag `page-content:{slug}` revalidated |
