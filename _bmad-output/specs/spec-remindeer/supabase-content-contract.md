# Supabase Contract — Landing (phase 1, anon)

Shared project `kyyzmkrqxxptukysrdfy` (West EU, Paris). The backoffice repo owns the whole schema (ADR-004). This repo never migrates it; it only regenerates `lib/supabase/database.types.ts` with `supabase gen types typescript --linked`. `supabase/migrations/` holds history only.

## Landing permissions

Reads (GET, `check_answer`) + mailing-list insert. Nothing else. Publishable key only; no secret key in the landing.

## Anon read matrix (enforced by RLS)

| Table | Readable columns | Row scope |
|---|---|---|
| `questions` | `id, official_number, text, image_id, category_id, is_free` | `is_free = true` only |
| `question_options` | `id, question_id, text, position` | **`is_correct` not readable** |
| `mnemonics` | `id, question_id, text` (nullable), `image_id` (nullable) | one per question; at least text or image |
| `categories` | `id, name` | — |
| `images` | `id, storage_path, file_name, mime_type` | images of free questions only |

Always list columns. `select *` fails (touches `is_correct`).

## Query shape

```ts
supabase.from("questions").select(`
  id, official_number, text,
  categories(name),
  image:images(storage_path),
  question_options(id, text, position),
  mnemonics(text, image:images(storage_path))
`).eq("is_free", true).order("official_number")
```

## Answer check (server-side only)

```ts
supabase.rpc("check_answer", { p_question_id, p_option_id })
// → [{ is_correct: boolean, correct_option_id: uuid }]
```

| Code | Meaning | Landing handling |
|---|---|---|
| `P0002` | question not visible | counted as wrong |
| `22023` | option not in question | counted as wrong |

## Images

Private bucket `question-images`; `storage.from("question-images").createSignedUrls(paths, 3600)`, signed per `/quiz` request. Unsigned path = no image.

## Mailing list

Deployed `email_signups`: `id, email, created_at` only. Landing inserts `{ email }` (lowercased). Missing for backoffice (OQ-11): `source`, `consent_given_at`, `consent_text_version`, unique email, anon insert-only policy.

## lib/data funnel (ADR-003, lint-enforced for from/rpc/storage/auth)

| Function | Role |
|---|---|
| `getFreeQuestions()` | free questions + category + options + mnemonic + signed image URLs |
| `checkAnswer(questionId, optionId)` | wraps `check_answer`; `null` on P0002/22023 |
| `getImageUrls(paths)` | batch signed URLs |
| `insertEmailSignup(email)` | mailing-list insert |

## Identity rules

- Options keyed by uuid, never by `position`; display order shuffled (server per request, client on Ritenta).
- Question ids are uuids.
