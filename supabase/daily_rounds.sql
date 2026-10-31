-- The daily rounds, on their own.
--
-- schema.sql holds the whole database. This is only the part that was added
-- with the year-long question bank. Paste it into Supabase -> SQL Editor and
-- run it. Running it again is safe.

-- One row per day and region: the ten questions of that day's round, written
-- by scripts/daily/schedule.ts. Only the server reads it, and /api/daily
-- hands a day out once that day has started somewhere in the world.
create table if not exists public.daily_rounds (
  day_key text not null,
  region text not null,
  questions jsonb not null,
  created_at timestamptz not null default now(),
  primary key (day_key, region)
);

alter table public.daily_rounds enable row level security;

drop policy if exists "the service role reads the daily rounds" on public.daily_rounds;
create policy "the service role reads the daily rounds"
  on public.daily_rounds for select
  to service_role
  using (true);

drop policy if exists "the service role writes the daily rounds" on public.daily_rounds;
create policy "the service role writes the daily rounds"
  on public.daily_rounds for insert
  to service_role
  with check (true);

-- Tell the REST API about the new table straight away.
notify pgrst, 'reload schema';
