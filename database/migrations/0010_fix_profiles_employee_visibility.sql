-- Digital Loyalty Wallet SaaS
-- Fix: business owner can't see their employees' names/emails
--
-- profiles RLS ("profiles_select_own") is `auth_id = auth.uid()` — by
-- design, a user can only read their own profile row except admin. That
-- also silently blocked the owner from reading an employee's profile via
-- the embedded select in getEmployees() (app/dashboard/employees/page.tsx
-- shows blank name/email), caught via e2e testing.
--
-- Fix: SECURITY DEFINER function that reads employees + businesses
-- bypassing their RLS entirely (not just delegating to another
-- RLS-protected query, which is what caused the 0008/0009 recursion bug) —
-- this is the safest form of the pattern, since the function's internal
-- query never goes through RLS on either table regardless of how their
-- policies are written.

create or replace function public.owned_business_employee_profile_ids()
returns setof uuid
language sql
security definer set search_path = public
stable
as $$
  select e.profile_id
  from public.employees e
  join public.businesses b on b.id = e.business_id
  where b.owner_id = public.current_profile_id();
$$;

create policy "profiles_select_owned_employees" on public.profiles
  for select using (id in (select public.owned_business_employee_profile_ids()));
