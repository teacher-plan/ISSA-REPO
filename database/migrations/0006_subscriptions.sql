-- Digital Loyalty Wallet SaaS
-- Phase 7: Subscription System
-- Tables: subscription_plans, subscriptions
-- See docs/loyalty-wallet-saas/03_Database_Design.md (Table 11),
-- docs/loyalty-wallet-saas/09_Development_Roadmap.md (Phase 7: Trial,
-- Upgrade, Expiration, Billing)
--
-- Billing (actual payment collection) is intentionally NOT built here —
-- that needs a real payment provider account, same external-dependency
-- pattern as Phase 6's wallet provider. What's built: plan limits enforced
-- at the DB level, automatic trial provisioning + lazy expiry, and an
-- admin-operated manual plan/status override standing in for billing until
-- a provider is wired up.

-- ---------------------------------------------------------------------------
-- subscription_plans — a small fixed lookup table, editable by admin
-- ---------------------------------------------------------------------------

create table if not exists public.subscription_plans (
  plan_name text primary key check (plan_name in ('starter', 'professional', 'enterprise')),
  display_name text not null,
  price_omr numeric not null default 0,
  customer_limit integer check (customer_limit is null or customer_limit > 0),
  trial_days integer not null default 14,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.subscription_plans (plan_name, display_name, price_omr, customer_limit, trial_days)
values
  ('starter', 'Starter', 15, 500, 14),
  ('professional', 'Professional', 35, 2000, 14),
  ('enterprise', 'Enterprise', 75, null, 14)
on conflict (plan_name) do nothing;

drop trigger if exists set_updated_at on public.subscription_plans;
create trigger set_updated_at
  before update on public.subscription_plans
  for each row execute function public.set_updated_at();

alter table public.subscription_plans enable row level security;

create policy "subscription_plans_select_all" on public.subscription_plans
  for select using (true);

create policy "subscription_plans_update_admin" on public.subscription_plans
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  plan_name text not null references public.subscription_plans (plan_name),
  status text not null default 'trial' check (status in ('trial', 'active', 'expired', 'cancelled')),
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_business_id_idx on public.subscriptions (business_id);

drop trigger if exists set_updated_at on public.subscriptions;
create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_owner" on public.subscriptions
  for select using (
    business_id in (select id from public.businesses where owner_id = public.current_profile_id())
  );

create policy "subscriptions_all_admin" on public.subscriptions
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Auto-provision a trial subscription when a business is created
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_business()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_trial_days integer;
begin
  select trial_days into v_trial_days
  from public.subscription_plans where plan_name = 'starter';

  insert into public.subscriptions (business_id, plan_name, status, start_date, end_date)
  values (
    new.id,
    'starter',
    'trial',
    current_date,
    current_date + coalesce(v_trial_days, 14)
  )
  on conflict (business_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_business_created on public.businesses;
create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();

-- ---------------------------------------------------------------------------
-- get_effective_subscription_status(): a 'trial' whose end_date has passed
-- reads as 'expired' without a background job physically flipping the row
-- (no worker in this stack — see 09_Development_Roadmap.md Phase 7 vs. the
-- simplification noted in AGENTS.md for wallet sync retries, same idea).
-- ---------------------------------------------------------------------------

create or replace function public.get_effective_subscription_status(p_business_id uuid)
returns text
language sql
security definer set search_path = public
stable
as $$
  select case
    when s.status = 'trial' and s.end_date < current_date then 'expired'
    else s.status
  end
  from public.subscriptions s
  where s.business_id = p_business_id;
$$;

grant execute on function public.get_effective_subscription_status(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Enforce plan limits + subscription status at the DB level — never
-- trust an app-layer-only check, since RLS already lets the owner insert
-- directly.
-- ---------------------------------------------------------------------------

create or replace function public.check_customer_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_status text;
  v_limit integer;
  v_count integer;
begin
  v_status := public.get_effective_subscription_status(new.business_id);

  if v_status is null then
    -- no subscription row (shouldn't happen post-migration) — allow, don't block existing data
    return new;
  end if;

  if v_status in ('expired', 'cancelled') then
    raise exception 'subscription_inactive: انتهت صلاحية الاشتراك أو تم إلغاؤه.';
  end if;

  select sp.customer_limit into v_limit
  from public.subscriptions s
  join public.subscription_plans sp on sp.plan_name = s.plan_name
  where s.business_id = new.business_id;

  if v_limit is not null then
    select count(*) into v_count from public.customers where business_id = new.business_id;
    if v_count >= v_limit then
      raise exception 'customer_limit_reached: تم الوصول للحد الأقصى لعدد العملاء في خطتك الحالية (%). قم بترقية الخطة لإضافة المزيد.', v_limit;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_customer_limit on public.customers;
create trigger enforce_customer_limit
  before insert on public.customers
  for each row execute function public.check_customer_limit();
