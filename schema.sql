-- =====================================================================
-- SOUTHERN DRIVE MOTORS — Office database schema (consolidated)
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ========== Jobs (invoices + quotes) ==========
create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  doc_type     text not null check (doc_type in ('invoice','quote')),
  job_no       text,
  customer     text,
  vehicle      text,
  rego         text,
  phone        text,
  job_date     date,
  total        numeric,
  status       text default 'paid',
  data         jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists jobs_jobdate_idx on public.jobs (user_id, job_date desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ========== Expenses (parts purchases + refunds) ==========
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null default current_date,
  supplier    text,
  receipt_no  text,
  amount      numeric not null default 0,
  kind        text not null default 'purchase' check (kind in ('purchase','refund')),
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_user_date_idx on public.expenses (user_id, date desc);

-- ========== Presets (custom snippets) ==========
create table if not exists public.presets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,
  label      text not null,
  data       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ========== RLS: shared team (all authenticated users see everything) ==========
alter table public.jobs     enable row level security;
alter table public.expenses enable row level security;
alter table public.presets  enable row level security;

create policy "team_jobs_select" on public.jobs
  for select to authenticated using (true);
create policy "team_jobs_insert" on public.jobs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "team_jobs_update" on public.jobs
  for update to authenticated using (true);
create policy "team_jobs_delete" on public.jobs
  for delete to authenticated using (true);

create policy "team_expenses_select" on public.expenses
  for select to authenticated using (true);
create policy "team_expenses_insert" on public.expenses
  for insert to authenticated with check (auth.uid() = user_id);
create policy "team_expenses_update" on public.expenses
  for update to authenticated using (true);
create policy "team_expenses_delete" on public.expenses
  for delete to authenticated using (true);

create policy "team_presets_select" on public.presets
  for select to authenticated using (true);
create policy "team_presets_insert" on public.presets
  for insert to authenticated with check (auth.uid() = user_id);
create policy "team_presets_update" on public.presets
  for update to authenticated using (true);
create policy "team_presets_delete" on public.presets
  for delete to authenticated using (true);
