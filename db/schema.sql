-- Simple DB schema for Momentum MVP (Postgres / Supabase)

-- Playbooks: stores generated playbooks per user
create table if not exists playbooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  focus_area text,
  payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks history / archived sessions
create table if not exists tasks_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  playbook_id uuid references playbooks(id) null,
  payload jsonb,
  created_at timestamptz default now()
);

-- Journals
create table if not exists journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  playbook_id uuid references playbooks(id) null,
  entry text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
