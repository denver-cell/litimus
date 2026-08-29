-- Litimus Supabase schema.
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a
-- fresh project. Assumes Supabase Auth is enabled (auth.users exists).

create extension if not exists "pgcrypto";

-- One row per user, holding plan/billing state that isn't already on
-- auth.users. `plan` is what the backend actually enforces (see
-- backend/lib/pricing.ts) — it's kept here rather than only in
-- `subscriptions` so a single indexed lookup is enough on every request.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'student', 'pro', 'team')),
  student_verified_until timestamptz,
  created_at timestamptz not null default now()
);

-- Populate profiles automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Daily word usage, keyed by either an authenticated user OR a hashed IP
-- for anonymous free-tier scans (never both on the same row).
create table if not exists public.usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  ip_hash text,
  usage_date date not null,
  words_used integer not null default 0,
  constraint usage_daily_user_or_ip check (
    (user_id is not null and ip_hash is null) or (user_id is null and ip_hash is not null)
  )
);

create unique index if not exists usage_daily_user_date_idx
  on public.usage_daily (user_id, usage_date) where user_id is not null;

create unique index if not exists usage_daily_ip_date_idx
  on public.usage_daily (ip_hash, usage_date) where ip_hash is not null;

-- One-time $3 day-pass top-ups (+10,000 words / 24h), granted only by the
-- PayFast ITN webhook after a confirmed payment.
create table if not exists public.day_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  purchased_at timestamptz not null default now(),
  expires_at timestamptz not null,
  words_granted integer not null default 10000,
  payfast_payment_id text
);

create index if not exists day_passes_user_active_idx
  on public.day_passes (user_id, expires_at);

-- Recurring subscription state, mirrored from PayFast's ITN webhook.
-- `profiles.plan` is the field actually enforced; this table is the
-- billing-history/audit record and holds the PayFast token needed to
-- manage or cancel a subscription later.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'student', 'pro', 'team')),
  status text not null default 'active' check (status in ('active', 'past_due', 'cancelled')),
  payfast_token text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: users can read their own rows; all writes to these
-- tables happen server-side via the service-role key (see
-- backend/lib/supabaseAdmin.ts), which bypasses RLS entirely, so no
-- write policies are needed here.
alter table public.profiles enable row level security;
alter table public.usage_daily enable row level security;
alter table public.day_passes enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can read their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can read their own usage" on public.usage_daily
  for select using (auth.uid() = user_id);

create policy "Users can read their own day passes" on public.day_passes
  for select using (auth.uid() = user_id);

create policy "Users can read their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
