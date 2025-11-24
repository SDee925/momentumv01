-- Row Level Security (RLS) policies for Momentum
-- These are example policies intended for Supabase/Postgres.
-- Apply these after creating the tables and enable RLS.

-- Playbooks: only the owner can select/insert/update/delete their playbooks
alter table if exists playbooks enable row level security;
create policy if not exists "playbooks_owner_policy" on playbooks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tasks history: only the owner can access their archived sessions
alter table if exists tasks_history enable row level security;
create policy if not exists "tasks_history_owner_policy" on tasks_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Journals: only the owner can access their journal entries
alter table if exists journals enable row level security;
create policy if not exists "journals_owner_policy" on journals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notes:
-- 1) The Edge Function must run with the Supabase service-role key to bypass RLS for server-side writes.
-- 2) During development you may want to add broader policies or temporary exceptions, but DO NOT leave permissive rules in production.
