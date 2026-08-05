-- Digital Loyalty Wallet SaaS
-- Phase 2: Business Dashboard
-- Tables: business_settings
-- See docs/loyalty-wallet-saas/03_Database_Design.md (Table 3)

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  primary_color text not null default '#18181b',
  secondary_color text not null default '#f4f4f5',
  language text not null default 'ar',
  timezone text not null default 'Asia/Muscat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_settings_business_id_idx
  on public.business_settings (business_id);

drop trigger if exists set_updated_at on public.business_settings;
create trigger set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

alter table public.business_settings enable row level security;

create policy "business_settings_select_owner" on public.business_settings
  for select using (
    business_id in (
      select id from public.businesses where owner_id = public.current_profile_id()
    )
  );

create policy "business_settings_insert_owner" on public.business_settings
  for insert with check (
    business_id in (
      select id from public.businesses where owner_id = public.current_profile_id()
    )
  );

create policy "business_settings_update_owner" on public.business_settings
  for update using (
    business_id in (
      select id from public.businesses where owner_id = public.current_profile_id()
    )
  );

create policy "business_settings_select_admin" on public.business_settings
  for select using (public.current_role() = 'admin');
