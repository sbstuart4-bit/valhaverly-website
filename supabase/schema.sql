-- Valhaverly Steward Partner Program — Supabase schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Partner applications
create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  status text not null default 'Draft'
    check (status in ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Suspended')),
  email text not null,
  password_hash text,
  personal jsonb not null default '{}'::jsonb,
  professional jsonb not null default '{}'::jsonb,
  market jsonb not null default '{}'::jsonb,
  partner_fit jsonb not null default '{}'::jsonb,
  verification jsonb not null default '{}'::jsonb,
  agreement jsonb not null default '{}'::jsonb,
  partner_profile jsonb,
  audit_trail jsonb not null default '[]'::jsonb,
  email_verified boolean not null default false,
  application_date date,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_partner_applications_email
  on public.partner_applications (lower(email));

create index if not exists idx_partner_applications_status
  on public.partner_applications (status);

-- Partner ID sequence metadata
create table if not exists public.partner_meta (
  key text primary key,
  value jsonb not null
);

insert into public.partner_meta (key, value)
values ('next_partner_sequence', '3'::jsonb)
on conflict (key) do nothing;

insert into public.partner_meta (key, value)
values ('demo_seeded', 'false'::jsonb)
on conflict (key) do nothing;

-- Updated_at trigger
create or replace function public.set_partner_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists partner_applications_updated_at on public.partner_applications;
create trigger partner_applications_updated_at
  before update on public.partner_applications
  for each row execute function public.set_partner_updated_at();

-- Row Level Security
alter table public.partner_applications enable row level security;
alter table public.partner_meta enable row level security;

-- Allow API access via anon key (from .env.local) until service role is configured.
-- Tighten these policies when SUPABASE_SERVICE_ROLE_KEY is in use in production.
drop policy if exists "partner_applications_anon_all" on public.partner_applications;
create policy "partner_applications_anon_all"
  on public.partner_applications for all
  using (true) with check (true);

drop policy if exists "partner_meta_anon_all" on public.partner_meta;
create policy "partner_meta_anon_all"
  on public.partner_meta for all
  using (true) with check (true);

-- Storage: create bucket "partner-verification" (private) in Dashboard, then run:
-- drop policy if exists "partner_verification_insert" on storage.objects;
-- create policy "partner_verification_insert" on storage.objects for insert with check (bucket_id = 'partner-verification');
-- drop policy if exists "partner_verification_select" on storage.objects;
-- create policy "partner_verification_select" on storage.objects for select using (bucket_id = 'partner-verification');
