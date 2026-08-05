-- Digital Loyalty Wallet SaaS
-- Phase 3: Loyalty Engine
-- Tables: loyalty_programs, customers, loyalty_cards, transactions
-- See docs/loyalty-wallet-saas/03_Database_Design.md (Tables 4-6, 9)

-- ---------------------------------------------------------------------------
-- loyalty_programs
-- ---------------------------------------------------------------------------

create table if not exists public.loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  earning_type text not null default 'visit'
    check (earning_type in ('visit', 'amount')),
  points_per_visit integer not null default 1,
  points_per_amount numeric not null default 1,
  reward_threshold integer not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists loyalty_programs_business_id_idx
  on public.loyalty_programs (business_id);

-- only one active program per business
create unique index if not exists loyalty_programs_one_active_per_business
  on public.loyalty_programs (business_id)
  where is_active;

drop trigger if exists set_updated_at on public.loyalty_programs;
create trigger set_updated_at
  before update on public.loyalty_programs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  birth_date date,
  total_points integer not null default 0,
  total_visits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, phone)
);

create index if not exists customers_business_id_idx on public.customers (business_id);
create index if not exists customers_phone_idx on public.customers (phone);

drop trigger if exists set_updated_at on public.customers;
create trigger set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- loyalty_cards
-- ---------------------------------------------------------------------------

create table if not exists public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  card_number text not null default encode(gen_random_bytes(6), 'hex'),
  current_points integer not null default 0,
  status text not null default 'active'
    check (status in ('active', 'blocked', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, customer_id)
);

create index if not exists loyalty_cards_business_id_idx on public.loyalty_cards (business_id);

drop trigger if exists set_updated_at on public.loyalty_cards;
create trigger set_updated_at
  before update on public.loyalty_cards
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  employee_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('earn', 'redeem', 'adjustment', 'refund')),
  points integer not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_customer_id_idx on public.transactions (customer_id);
create index if not exists transactions_created_at_idx on public.transactions (created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security — business_owner has full access scoped to own business
-- ---------------------------------------------------------------------------

alter table public.loyalty_programs enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.transactions enable row level security;

create policy "loyalty_programs_all_owner" on public.loyalty_programs
  for all using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  ) with check (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

create policy "customers_all_owner" on public.customers
  for all using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  ) with check (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

create policy "loyalty_cards_all_owner" on public.loyalty_cards
  for all using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  ) with check (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

create policy "transactions_select_owner" on public.transactions
  for select using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

-- Direct insert/update/delete on transactions is intentionally not granted —
-- all writes go through record_points_transaction() so throttling and point
-- totals stay consistent (see Anti-Fraud Throttling note in the roadmap).

-- ---------------------------------------------------------------------------
-- Points engine: record_points_transaction()
--
-- Single entrypoint for earning/redeeming/adjusting points. Runs as
-- SECURITY DEFINER so it can update customers/loyalty_cards/transactions
-- atomically, but re-checks business ownership itself first — callers never
-- bypass authorization. Also enforces a 30s anti-fraud throttle per
-- customer+type to block accidental double-scans (see 09_Development_Roadmap.md).
-- ---------------------------------------------------------------------------

create or replace function public.record_points_transaction(
  p_business_id uuid,
  p_customer_id uuid,
  p_type text,
  p_points integer,
  p_description text default null
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner_id uuid;
  v_customer_business_id uuid;
  v_last_tx timestamptz;
  v_delta integer;
  v_tx public.transactions;
begin
  select owner_id into v_owner_id from public.businesses where id = p_business_id;
  if v_owner_id is null or v_owner_id <> public.current_profile_id() then
    raise exception 'not authorized for this business';
  end if;

  if p_type not in ('earn', 'redeem', 'adjustment', 'refund') then
    raise exception 'invalid transaction type: %', p_type;
  end if;

  select business_id into v_customer_business_id
  from public.customers where id = p_customer_id;
  if v_customer_business_id is null or v_customer_business_id <> p_business_id then
    raise exception 'customer does not belong to this business';
  end if;

  select created_at into v_last_tx
  from public.transactions
  where customer_id = p_customer_id and type = p_type
  order by created_at desc
  limit 1;

  if v_last_tx is not null and now() - v_last_tx < interval '30 seconds' then
    raise exception 'throttled: a % transaction for this customer was just recorded, try again shortly', p_type;
  end if;

  v_delta := case
    when p_type in ('earn', 'refund') then p_points
    when p_type = 'redeem' then -p_points
    else p_points
  end;

  insert into public.transactions (business_id, customer_id, employee_id, type, points, description)
  values (p_business_id, p_customer_id, public.current_profile_id(), p_type, p_points, p_description)
  returning * into v_tx;

  update public.customers
  set total_points = total_points + v_delta,
      total_visits = total_visits + case when p_type = 'earn' then 1 else 0 end
  where id = p_customer_id;

  insert into public.loyalty_cards (business_id, customer_id)
  values (p_business_id, p_customer_id)
  on conflict (business_id, customer_id) do nothing;

  update public.loyalty_cards
  set current_points = current_points + v_delta
  where business_id = p_business_id and customer_id = p_customer_id;

  return v_tx;
end;
$$;
