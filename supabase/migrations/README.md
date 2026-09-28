# Historical — do not push

The shared Supabase schema is owned by the backoffice repo (ADR-004). These files record what this repo created before that decision; they are never pushed again. Schema changes go to the backoffice; this repo only regenerates types (`supabase gen types typescript --linked`).
