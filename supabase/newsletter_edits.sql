-- The newsletter edits, on their own.
--
-- schema.sql holds the whole database. This is only the part that was added
-- with the admin edits. Paste it into Supabase -> SQL Editor and run it.
-- Running it again is safe.

-- One row per day and region: the subject, preheader and intro line the admin
-- wrote for that day's email. Both the admin and the cron read it, so a saved
-- edit is what goes out. Only the server reads or writes it.
create table if not exists public.newsletter_edits (
  day_key text not null,
  region text not null,
  subject text,
  preheader text,
  intro text,
  updated_at timestamptz not null default now(),
  primary key (day_key, region)
);

alter table public.newsletter_edits enable row level security;

drop policy if exists "the service role reads the newsletter edits" on public.newsletter_edits;
create policy "the service role reads the newsletter edits"
  on public.newsletter_edits for select
  to service_role
  using (true);

drop policy if exists "the service role writes the newsletter edits" on public.newsletter_edits;
create policy "the service role writes the newsletter edits"
  on public.newsletter_edits for insert
  to service_role
  with check (true);

drop policy if exists "the service role changes the newsletter edits" on public.newsletter_edits;
create policy "the service role changes the newsletter edits"
  on public.newsletter_edits for update
  to service_role
  using (true)
  with check (true);

drop policy if exists "the service role removes the newsletter edits" on public.newsletter_edits;
create policy "the service role removes the newsletter edits"
  on public.newsletter_edits for delete
  to service_role
  using (true);

-- Tell the REST API about the new table straight away.
notify pgrst, 'reload schema';
