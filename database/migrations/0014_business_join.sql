-- Digital Loyalty Wallet SaaS
-- Self-service customer signup: one QR per business, printed once at the
-- counter, scanned by a customer's own phone camera (not the in-app
-- employee scanner) to join and receive their wallet card — no staff data
-- entry required for a brand-new customer.
--
-- Two new SECURITY DEFINER RPCs, same pattern as get_public_card() (0005):
-- RLS on businesses/business_settings/customers is owner-scoped, so an
-- anonymous visitor cannot read or write those tables directly. Both
-- functions are display/write funnels that re-check everything themselves
-- rather than trusting the caller.

-- Display-only preview for the public join page: the business's name, logo
-- and card theme, so the page can greet the customer in the shop's own
-- identity before asking for their details. Never returns owner info,
-- contact details, or anything beyond what /c/[id] already exposes.
create or replace function public.get_public_business(p_business_id uuid)
returns table (
  business_name text,
  business_logo_url text,
  card_theme jsonb
)
language sql
security definer set search_path = public
stable
as $$
  select b.name, b.logo_url, bs.card_theme
  from public.businesses b
  left join public.business_settings bs on bs.business_id = b.id
  where b.id = p_business_id;
$$;

grant execute on function public.get_public_business(uuid) to anon, authenticated;

-- Joins a customer to a business from the public page, or recognises them if
-- the phone number already exists for this business — a repeat scan (lost
-- card, new phone) should hand back the existing card, not a "duplicate"
-- error. check_customer_limit() (0006) still fires on the insert below like
-- any other write to customers, so plan limits and subscription status are
-- enforced exactly as they are for owner/employee-created customers; this
-- function does not special-case or bypass that trigger.
create or replace function public.public_join_business(
  p_business_id uuid,
  p_name text,
  p_phone text
)
returns table (wallet_card_id uuid)
language plpgsql
security definer set search_path = public
as $$
declare
  v_name text := trim(p_name);
  v_phone text := trim(p_phone);
  v_customer_id uuid;
begin
  if v_name = '' or v_phone = '' then
    raise exception 'invalid_input: الاسم ورقم الهاتف مطلوبان.';
  end if;

  if not exists (select 1 from public.businesses where id = p_business_id) then
    raise exception 'business_not_found: رمز غير صالح.';
  end if;

  select id into v_customer_id
  from public.customers
  where business_id = p_business_id and phone = v_phone;

  if v_customer_id is null then
    insert into public.customers (business_id, name, phone)
    values (p_business_id, v_name, v_phone)
    returning id into v_customer_id;
  end if;

  -- on_customer_created (0005) provisions this row synchronously in the same
  -- transaction as the insert above, so it is already there to read here —
  -- including on the very first join.
  return query
    select wc.id
    from public.wallet_cards wc
    where wc.customer_id = v_customer_id and wc.business_id = p_business_id;
end;
$$;

grant execute on function public.public_join_business(uuid, text, text) to anon, authenticated;
