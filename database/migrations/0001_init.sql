-- Digital Loyalty Wallet SaaS
-- Phase 1: Authentication & User System
-- Tables: profiles, businesses
-- See docs/loyalty-wallet-saas/03_Database_Design.md

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null default 'customer'
    check (role in ('admin', 'business_owner', 'employee', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_auth_id_idx on public.profiles (auth_id);

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  logo_url text,
  phone text,
  email text,
  address text,
  country text,
  currency text not null default 'OMR',
  status text not null default 'trial'
    check (status in ('active', 'trial', 'suspended', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_owner_id_idx on public.businesses (owner_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.businesses;
create trigger set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (auth_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- helper functions (security definer to avoid RLS recursion on profiles)
-- ---------------------------------------------------------------------------

create or replace function public.current_profile_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select id from public.profiles where auth_id = auth.uid();
$$;

create or replace function public.current_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where auth_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;

-- profiles: a user can read and update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth_id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (auth_id = auth.uid());

-- profiles: platform admins can read every profile
create policy "profiles_select_admin" on public.profiles
  for select using (public.current_role() = 'admin');

-- businesses: owners manage their own business
create policy "businesses_select_owner" on public.businesses
  for select using (owner_id = public.current_profile_id());

create policy "businesses_insert_owner" on public.businesses
  for insert with check (owner_id = public.current_profile_id());

create policy "businesses_update_owner" on public.businesses
  for update using (owner_id = public.current_profile_id());

-- businesses: platform admins have full read access
create policy "businesses_select_admin" on public.businesses
  for select using (public.current_role() = 'admin');
