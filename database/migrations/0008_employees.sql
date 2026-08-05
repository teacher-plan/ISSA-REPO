-- Digital Loyalty Wallet SaaS
-- Phase 4 (completing MVP scope): Employees
-- Table: employees
-- See docs/loyalty-wallet-saas/03_Database_Design.md (Table 10)
--
-- Employee accounts are business_owner-provisioned (owner sets the
-- employee's email + a temporary password via the Supabase Admin API —
-- see app/dashboard/employees/actions.ts), not self-signup or
-- email-invite-based, since no transactional email service is wired up
-- yet. handle_new_user() from 0001_init.sql already creates the profiles
-- row with role='employee' from the auth user's metadata.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  permissions jsonb not null default '{"add_points": true, "redeem_rewards": true, "manage_customers": false}'::jsonb,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_business_id_idx on public.employees (business_id);

drop trigger if exists set_updated_at on public.employees;
create trigger set_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

alter table public.employees enable row level security;

create policy "employees_all_owner" on public.employees
  for all using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  ) with check (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

create policy "employees_select_self" on public.employees
  for select using (profile_id = public.current_profile_id());

-- ---------------------------------------------------------------------------
-- Earlier phases' RLS only ever granted access to the business owner
-- (owner_id = current_profile_id()). Active employees now need their own
-- read access to the tables the "Employee Mode" page touches — these are
-- additional permissive policies (RLS ORs same-command policies together),
-- so owner access is unaffected.
-- ---------------------------------------------------------------------------

create policy "businesses_select_employee" on public.businesses
  for select using (
    id in (
      select business_id from public.employees
      where profile_id = public.current_profile_id() and status = 'active'
    )
  );

create policy "customers_select_employee" on public.customers
  for select using (
    business_id in (
      select business_id from public.employees
      where profile_id = public.current_profile_id() and status = 'active'
    )
  );

create policy "customers_insert_employee" on public.customers
  for insert with check (
    business_id in (
      select business_id from public.employees
      where profile_id = public.current_profile_id() and status = 'active'
        and (permissions ->> 'manage_customers')::boolean is true
    )
  );

create policy "loyalty_programs_select_employee" on public.loyalty_programs
  for select using (
    business_id in (
      select business_id from public.employees
      where profile_id = public.current_profile_id() and status = 'active'
    )
  );

create policy "rewards_select_employee" on public.rewards
  for select using (
    business_id in (
      select business_id from public.employees
      where profile_id = public.current_profile_id() and status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- record_points_transaction() — same 6-arg signature as 0004_rewards.sql
-- (create or replace is safe here, no drop needed — only the body changes).
-- Authorization now accepts an active employee of the business, not just
-- its owner, matching 09_Development_Roadmap.md's "Employee adds +2
-- points" example.
-- ---------------------------------------------------------------------------

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
  v_is_employee boolean;
  v_customer_business_id uuid;
  v_last_tx timestamptz;
  v_delta integer;
  v_tx public.transactions;
begin
  select owner_id into v_owner_id from public.businesses where id = p_business_id;

  select exists(
    select 1 from public.employees
    where business_id = p_business_id
      and profile_id = public.current_profile_id()
      and status = 'active'
      and (permissions ->> 'add_points')::boolean is not false
  ) into v_is_employee;

  if v_owner_id is null or (v_owner_id <> public.current_profile_id() and not v_is_employee) then
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
-- redeem_reward() — same 3-arg signature as 0004_rewards.sql, authorization
-- broadened the same way.
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
  v_is_employee boolean;
  v_reward public.rewards;
  v_customer public.customers;
  v_tx public.transactions;
begin
  select owner_id into v_owner_id from public.businesses where id = p_business_id;

  select exists(
    select 1 from public.employees
    where business_id = p_business_id
      and profile_id = public.current_profile_id()
      and status = 'active'
      and (permissions ->> 'redeem_rewards')::boolean is not false
  ) into v_is_employee;

  if v_owner_id is null or (v_owner_id <> public.current_profile_id() and not v_is_employee) then
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
