create table if not exists quiz_completions (
  id uuid primary key default gen_random_uuid(),
  score integer not null,
  feedback smallint check (feedback between 1 and 5),
  email text,
  completed_at timestamptz not null
);

alter table quiz_completions enable row level security;
-- No policies defined: RLS with zero policies denies all access to anon/publishable keys.
-- The server-side secret key (sb_secret_...) bypasses RLS by design (AD-5).
