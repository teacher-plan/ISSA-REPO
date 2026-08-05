-- Digital Loyalty Wallet SaaS
-- Phase 5: Rewards System
-- Tables: rewards
-- See docs/loyalty-wallet-saas/03_Database_Design.md (Table 8)

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  points_required integer not null check (points_required > 0),
  quantity integer check (quantity is null or quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rewards_business_id_idx on public.rewards (business_id);

drop trigger if exists set_updated_at on public.rewards;
create trigger set_updated_at
  before update on public.rewards
  for each row execute function public.set_updated_at();

alter table public.rewards enable row level security;

create policy "rewards_all_owner" on public.rewards
  for all using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  ) with check (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

-- Track which reward a redemption transaction was for (nullable — manual
-- point adjustments have no reward). Lets the dashboard count reward
-- redemptions without parsing the free-text description.
alter table public.transactions
  add column if not exists reward_id uuid references public.rewards (id) on delete set null;

create index if not exists transactions_reward_id_idx on public.transactions (reward_id);

-- ---------------------------------------------------------------------------
-- record_points_transaction() — replaced from 0003_loyalty_engine.sql to add
-- an optional p_reward_id, stamped onto the ledger row when a reward-driven
-- redemption calls this through redeem_reward() below.
--
-- `create or replace` does NOT replace a function whose parameter list
-- changed — Postgres treats a different arg count as a distinct overload,
-- which left both the 5-arg and 6-arg versions defined and made every call
-- ambiguous. The old 5-arg signature must be dropped explicitly first.
-- ---------------------------------------------------------------------------

drop function if exists public.record_points_transaction(uuid, uuid, text, integer, text);

create or replace function public.record_points_transaction(
  p_business_id uuid,
  p_customer_id uuid,
  p_type text,
  p_points integer,
  p_description text default null,
  p_reward_id uuid default null
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

  insert into public.transactions (business_id, customer_id, employee_id, type, points, description, reward_id)
  values (p_business_id, p_customer_id, public.current_profile_id(), p_type, p_points, p_description, p_reward_id)
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

-- ---------------------------------------------------------------------------
-- redeem_reward(): validates points/stock server-side, then delegates to
-- record_points_transaction() for the throttle + ledger + point-total logic
-- shared with manual redemptions.
-- ---------------------------------------------------------------------------

create or replace function public.redeem_reward(
  p_business_id uuid,
  p_customer_id uuid,
  p_reward_id uuid
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner_id uuid;
  v_reward public.rewards;
  v_customer public.customers;
  v_tx public.transactions;
begin
  select owner_id into v_owner_id from public.businesses where id = p_business_id;
  if v_owner_id is null or v_owner_id <> public.current_profile_id() then
    raise exception 'not authorized for this business';
  end if;

  select * into v_reward from public.rewards
  where id = p_reward_id and business_id = p_business_id;
  if v_reward is null then
    raise exception 'reward not found';
  end if;
  if not v_reward.is_active then
    raise exception 'reward is not active';
  end if;
  if v_reward.quantity is not null and v_reward.quantity <= 0 then
    raise exception 'reward is out of stock';
  end if;

  select * into v_customer from public.customers
  where id = p_customer_id and business_id = p_business_id;
  if v_customer is null then
    raise exception 'customer not found';
  end if;
  if v_customer.total_points < v_reward.points_required then
    raise exception 'customer does not have enough points for this reward';
  end if;

  select * into v_tx from public.record_points_transaction(
    p_business_id,
    p_customer_id,
    'redeem',
    v_reward.points_required,
    'استبدال مكافأة: ' || v_reward.name,
    p_reward_id
  );

  if v_reward.quantity is not null then
    update public.rewards set quantity = quantity - 1 where id = p_reward_id;
  end if;

  return v_tx;
end;
$$;
