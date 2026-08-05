-- Digital Loyalty Wallet SaaS
-- Phase 9: QR scanning — the employee scans the QR shown on the customer's
-- wallet pass, and the points land straight in the ledger.
--
-- The QR payload is the wallet_cards.id already used as the "secure token"
-- for the public /c/[id] page (06_Wallet_Integration.md section 15). Nothing
-- new is minted: one unguessable UUID identifies the card everywhere.
--
-- No new points path either. resolve_wallet_card() only *reads* the card and
-- answers "who is this, and may you serve them?" — the write still goes
-- through record_points_transaction()/redeem_reward(), keeping the 30s
-- anti-fraud throttle and the customers/loyalty_cards sync in one place.

-- ---------------------------------------------------------------------------
-- resolve_wallet_card(p_wallet_card_id)
--
-- SECURITY DEFINER because a scan has to work for an employee too, and
-- wallet_cards' own RLS is owner-scoped. The ownership check is therefore
-- done explicitly here — same shape as record_points_transaction()'s check
-- in 0008, and deliberately NOT a raw subquery into a table whose own policy
-- subqueries back (see the RLS recursion note in AGENTS.md).
--
-- Returns nothing (0 rows) when the caller is not entitled to this card, so
-- scanning another business's QR is indistinguishable from scanning a bogus
-- one — no existence oracle.
-- ---------------------------------------------------------------------------

create or replace function public.resolve_wallet_card(p_wallet_card_id uuid)
returns table (
  wallet_card_id uuid,
  business_id uuid,
  customer_id uuid,
  customer_name text,
  customer_phone text,
  total_points integer,
  total_visits integer,
  reward_threshold integer
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_business_id uuid;
  v_owner_id uuid;
  v_is_employee boolean;
begin
  select wc.business_id into v_business_id
  from public.wallet_cards wc
  where wc.id = p_wallet_card_id;

  if v_business_id is null then
    return;  -- unknown card
  end if;

  select b.owner_id into v_owner_id
  from public.businesses b
  where b.id = v_business_id;

  select exists(
    select 1 from public.employees e
    where e.business_id = v_business_id
      and e.profile_id = public.current_profile_id()
      and e.status = 'active'
  ) into v_is_employee;

  if v_owner_id is distinct from public.current_profile_id() and not v_is_employee then
    return;  -- not this caller's customer
  end if;

  return query
  select
    wc.id,
    wc.business_id,
    c.id,
    c.name,
    c.phone,
    c.total_points,
    c.total_visits,
    lp.reward_threshold
  from public.wallet_cards wc
  join public.customers c on c.id = wc.customer_id
  left join public.loyalty_programs lp
    on lp.business_id = wc.business_id and lp.is_active
  where wc.id = p_wallet_card_id;
end;
$$;

grant execute on function public.resolve_wallet_card(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Google Wallet joins PassKit as an allowed provider. The check constraint in
-- 0005 hard-coded 'passkit'; widen it rather than drop it, so a typo in the
-- admin form still fails loudly.
-- ---------------------------------------------------------------------------

alter table public.wallet_provider_settings
  drop constraint if exists wallet_provider_settings_provider_name_check;

alter table public.wallet_provider_settings
  add constraint wallet_provider_settings_provider_name_check
  check (provider_name in ('passkit', 'google'));

-- Google Wallet identifies a pass class per business (the template), the same
-- role passkit_program_id/passkit_tier_id play for PassKit.
alter table public.business_settings
  add column if not exists google_wallet_class_id text;
