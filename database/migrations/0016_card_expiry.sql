-- Digital Loyalty Wallet SaaS
-- Phase 11-b (FR-3): card expiry. See docs/loyalty-wallet-saas/11_SRS_Phase11.md
-- section 4. Expiry is a property of each *card*, not a live lookup against
-- the business's current setting — set once at issuance and stored, so
-- changing the validity period later never silently expires a card a
-- customer was never told had a deadline (FR-3.2).

alter table public.business_settings
  add column if not exists card_validity_months integer
    check (card_validity_months is null or card_validity_months > 0);

alter table public.wallet_cards
  add column if not exists expires_at timestamptz;

-- handle_new_customer() (0005): now computes expires_at from whatever the
-- business's card_validity_months is *at the moment this customer joins* —
-- not a live formula re-evaluated on every read. A business_settings row
-- might not exist yet for a brand-new business, hence the left-join-style
-- select rather than assuming one is there.
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_validity_months integer;
  v_expires_at timestamptz;
begin
  select card_validity_months into v_validity_months
  from public.business_settings
  where business_id = new.business_id;

  if v_validity_months is not null then
    v_expires_at := now() + (v_validity_months || ' months')::interval;
  end if;

  insert into public.wallet_cards (business_id, customer_id, expires_at)
  values (new.business_id, new.id, v_expires_at)
  on conflict (business_id, customer_id) do nothing;
  return new;
end;
$$;

-- record_points_transaction() (0008): an expired card can still redeem a
-- reward already earned (FR-3.3) — the points are already the customer's —
-- so only p_type = 'earn' is blocked. Same signature as 0008, so
-- `create or replace` is safe (only the body changes, per that migration's
-- own note).
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
  v_card_expires_at timestamptz;
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

  -- Added in 0016: an expired card can still redeem a reward already
  -- earned — the points are already the customer's — so only 'earn' is
  -- blocked here. Everything else in this function is unchanged from 0008.
  if p_type = 'earn' then
    select expires_at into v_card_expires_at
    from public.wallet_cards
    where customer_id = p_customer_id and business_id = p_business_id;

    if v_card_expires_at is not null and v_card_expires_at < now() then
      raise exception 'card_expired: انتهت صلاحية بطاقة هذا العميل — لا يمكن تسجيل نقاط جديدة عليها. يمكن تجديدها من صفحة العميل.';
    end if;
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

-- Owner-initiated renewal (FR-3.4): recomputes expires_at from the
-- business's *current* card_validity_months, from the moment of renewal —
-- same formula handle_new_customer() uses at issuance, just re-run later.
-- If the business has since turned validity off, this clears expires_at
-- rather than leaving a stale date.
create or replace function public.renew_wallet_card(p_customer_id uuid)
returns public.wallet_cards
language plpgsql
security definer set search_path = public
as $$
declare
  v_business_id uuid;
  v_owner_id uuid;
  v_validity_months integer;
  v_card public.wallet_cards;
begin
  select business_id into v_business_id from public.customers where id = p_customer_id;
  if v_business_id is null then
    raise exception 'customer not found';
  end if;

  select owner_id into v_owner_id from public.businesses where id = v_business_id;
  if v_owner_id is null or v_owner_id <> public.current_profile_id() then
    raise exception 'not authorized for this business';
  end if;

  select card_validity_months into v_validity_months
  from public.business_settings where business_id = v_business_id;

  update public.wallet_cards
  set expires_at = case
    when v_validity_months is not null then now() + (v_validity_months || ' months')::interval
    else null
  end
  where customer_id = p_customer_id and business_id = v_business_id
  returning * into v_card;

  if v_card is null then
    raise exception 'wallet card not found';
  end if;

  return v_card;
end;
$$;

grant execute on function public.renew_wallet_card(uuid) to authenticated;

-- get_public_card() gains expires_at so /c/[id] can show (or gate on) it.
-- DROP first, not `create or replace`: adding an OUT column changes the
-- function's return type, which Postgres rejects with 42P13 — hit this
-- exact error in 0012 already.
begin;

drop function if exists public.get_public_card(uuid);

create function public.get_public_card(p_wallet_card_id uuid)
returns table (
  business_name text,
  business_logo_url text,
  primary_color text,
  secondary_color text,
  customer_name text,
  current_points integer,
  reward_threshold integer,
  offer_text text,
  expires_at timestamptz,
  wallet_url_apple text,
  wallet_url_google text,
  sync_status text,
  card_theme jsonb,
  card_business_kind text
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
    lp.offer_text,
    wc.expires_at,
    wc.wallet_url_apple,
    wc.wallet_url_google,
    wc.sync_status,
    bs.card_theme,
    bs.card_business_kind
  from public.wallet_cards wc
  join public.customers c on c.id = wc.customer_id
  join public.businesses b on b.id = wc.business_id
  left join public.business_settings bs on bs.business_id = b.id
  left join public.loyalty_programs lp on lp.business_id = b.id and lp.is_active
  where wc.id = p_wallet_card_id;
$$;

-- DROP discards the function's grants, so they must be re-issued here. Without
-- this the public card page stops working for unauthenticated visitors — which
-- is every customer.
grant execute on function public.get_public_card(uuid) to anon, authenticated;

commit;
