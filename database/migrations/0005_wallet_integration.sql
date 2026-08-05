-- Digital Loyalty Wallet SaaS
-- Phase 6: Wallet Integration
-- Tables: wallet_provider_settings, wallet_cards
-- See docs/loyalty-wallet-saas/06_Wallet_Integration.md, 03_Database_Design.md (Tables 7, 12)

-- ---------------------------------------------------------------------------
-- wallet_provider_settings — platform-wide (admin-configured), not per-business.
-- Only one active provider at a time; keeps history instead of overwriting.
-- ---------------------------------------------------------------------------

create table if not exists public.wallet_provider_settings (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null check (provider_name in ('passkit')),
  api_key text not null,
  api_secret text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists wallet_provider_settings_one_active
  on public.wallet_provider_settings (is_active)
  where is_active;

drop trigger if exists set_updated_at on public.wallet_provider_settings;
create trigger set_updated_at
  before update on public.wallet_provider_settings
  for each row execute function public.set_updated_at();

alter table public.wallet_provider_settings enable row level security;

-- Platform admin only — never exposed to business owners or the browser.
create policy "wallet_provider_settings_all_admin" on public.wallet_provider_settings
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Per-business PassKit Program + Tier (the pass template/design PassKit's
-- multi-tenant model requires — created by the business owner in PassKit's
-- own dashboard, since visual template design is explicitly out of scope
-- here per 06_Wallet_Integration.md section 20 ("do not build a Pass
-- Generator"). Nullable: wallet sync fails with a clear message until set.
alter table public.business_settings
  add column if not exists passkit_program_id text,
  add column if not exists passkit_tier_id text;

-- ---------------------------------------------------------------------------
-- wallet_cards
-- ---------------------------------------------------------------------------

create table if not exists public.wallet_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  provider_name text,
  external_card_id text,
  wallet_url_apple text,
  wallet_url_google text,
  platform text check (platform is null or platform in ('apple', 'google', 'both')),
  sync_status text not null default 'created'
    check (sync_status in ('created', 'generating', 'active', 'syncing', 'updated', 'failed')),
  last_error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, customer_id)
);

create index if not exists wallet_cards_business_id_idx on public.wallet_cards (business_id);
create index if not exists wallet_cards_customer_id_idx on public.wallet_cards (customer_id);
create index if not exists wallet_cards_external_card_id_idx on public.wallet_cards (external_card_id);

drop trigger if exists set_updated_at on public.wallet_cards;
create trigger set_updated_at
  before update on public.wallet_cards
  for each row execute function public.set_updated_at();

alter table public.wallet_cards enable row level security;

create policy "wallet_cards_all_owner" on public.wallet_cards
  for all using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  ) with check (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

create policy "wallet_cards_select_admin" on public.wallet_cards
  for select using (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Auto-provision a wallet_cards row whenever a customer is created — matches
-- the "Employee creates customer -> Create Loyalty Card -> Wallet Service
-- Trigger" flow in 06_Wallet_Integration.md section 6. Actually calling the
-- wallet provider happens server-side (lib/wallet/sync.ts), not here; this
-- trigger just guarantees the row exists in 'created' state immediately.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.wallet_cards (business_id, customer_id)
  values (new.business_id, new.id)
  on conflict (business_id, customer_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_customer_created on public.customers;
create trigger on_customer_created
  after insert on public.customers
  for each row execute function public.handle_new_customer();

-- ---------------------------------------------------------------------------
-- get_public_card(): the only way an unauthenticated visitor (the customer
-- holding the card link/QR) can read card data. Returns just the display
-- fields needed for the /c/[id] page — never phone/email/business owner
-- info. p_wallet_card_id is the "secure token" from the QR code (an
-- unguessable UUID), per 06_Wallet_Integration.md section 15.
-- ---------------------------------------------------------------------------

create or replace function public.get_public_card(p_wallet_card_id uuid)
returns table (
  business_name text,
  business_logo_url text,
  primary_color text,
  secondary_color text,
  customer_name text,
  current_points integer,
  reward_threshold integer,
  wallet_url_apple text,
  wallet_url_google text,
  sync_status text
)
language sql
security definer set search_path = public
stable
as $$
  select
    b.name,
    b.logo_url,
    coalesce(bs.primary_color, '#18181b'),
    coalesce(bs.secondary_color, '#f4f4f5'),
    c.name,
    c.total_points,
    lp.reward_threshold,
    wc.wallet_url_apple,
    wc.wallet_url_google,
    wc.sync_status
  from public.wallet_cards wc
  join public.customers c on c.id = wc.customer_id
  join public.businesses b on b.id = wc.business_id
  left join public.business_settings bs on bs.business_id = b.id
  left join public.loyalty_programs lp on lp.business_id = b.id and lp.is_active
  where wc.id = p_wallet_card_id;
$$;

grant execute on function public.get_public_card(uuid) to anon, authenticated;
