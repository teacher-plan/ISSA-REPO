-- Digital Loyalty Wallet SaaS
-- Fix: infinite RLS recursion between businesses <-> employees
--
-- 0008_employees.sql added "businesses_select_employee", a raw subquery
-- into public.employees. employees' own RLS ("employees_all_owner") has a
-- raw subquery back into public.businesses. Evaluating either table's RLS
-- then re-triggers the other's RLS, which Postgres detects and rejects
-- with 42P17 "infinite recursion detected in policy for relation
-- businesses" — breaking getOwnedBusiness() for every business_owner,
-- caught via e2e testing (a fresh navigation to /dashboard/loyalty-program
-- silently redirected to /onboarding/business because the caller only
-- checked `data`, not `error`, on the failed query).
--
-- Fix: the same SECURITY DEFINER helper-function pattern already used by
-- current_profile_id()/current_role() to break the profiles RLS recursion.
-- A SECURITY DEFINER function reads employees bypassing employees' RLS
-- entirely, so evaluating businesses' policy never re-enters employees'
-- policy evaluation.

create or replace function public.current_employee_business_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select business_id from public.employees
  where profile_id = public.current_profile_id() and status = 'active'
  limit 1;
$$;

create or replace function public.current_employee_has_permission(p_permission text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((permissions ->> p_permission)::boolean, false)
  from public.employees
  where profile_id = public.current_profile_id() and status = 'active';
$$;

drop policy if exists "businesses_select_employee" on public.businesses;
create policy "businesses_select_employee" on public.businesses
  for select using (id = public.current_employee_business_id());

drop policy if exists "customers_select_employee" on public.customers;
create policy "customers_select_employee" on public.customers
  for select using (business_id = public.current_employee_business_id());

drop policy if exists "customers_insert_employee" on public.customers;
create policy "customers_insert_employee" on public.customers
  for insert with check (
    business_id = public.current_employee_business_id()
    and public.current_employee_has_permission('manage_customers')
  );

drop policy if exists "loyalty_programs_select_employee" on public.loyalty_programs;
create policy "loyalty_programs_select_employee" on public.loyalty_programs
  for select using (business_id = public.current_employee_business_id());

drop policy if exists "rewards_select_employee" on public.rewards;
create policy "rewards_select_employee" on public.rewards
  for select using (business_id = public.current_employee_business_id());
