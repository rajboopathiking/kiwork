-- ============================================================
-- KIWORK — Phase 4 Additions
-- Run this in Supabase SQL Editor if you want to store content reports
-- ============================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending', -- pending, reviewed, resolved
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Authenticated or anon can submit reports
create policy "reports_insert" on public.reports
  for insert with check (true);

-- Users can only view their own submitted reports
create policy "reports_select" on public.reports
  for select to authenticated
  using (auth.uid() = reporter_id);
