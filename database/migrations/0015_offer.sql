-- Digital Loyalty Wallet SaaS
-- Phase 11-a (FR-1): the offer — what a customer must do and what they get
-- — becomes a real, stored thing instead of an implied one. Today
-- loyalty_programs.reward_threshold sets the *shape* of the stamp grid, but
-- nothing on the card ever states the actual promise ("buy 9, get a free
-- coffee") — a customer sees an empty grid and has to ask staff what it's
-- for. See docs/loyalty-wallet-saas/11_SRS_Phase11.md section 2.

alter table public.loyalty_programs
  add column if not exists reward_type text
    check (reward_type in ('free_item', 'percent_discount', 'fixed_discount', 'free_service', 'custom')),
  add column if not exists reward_value text,
  add column if not exists offer_text text;

-- Existing rows (from before this migration) get a generic but honest
-- default so the not-null constraint below can apply uniformly — a real
-- offer_text is required going forward via the app form, not backfilled
-- with a guess at what the owner actually intended.
update public.loyalty_programs
set
  reward_type = coalesce(reward_type, 'custom'),
  offer_text = coalesce(offer_text, 'اشترِ ' || reward_threshold || ' مرات واحصل على مكافأة')
where offer_text is null;

alter table public.loyalty_programs
  alter column reward_type set not null,
  alter column reward_type set default 'free_item',
  alter column offer_text set not null;

-- get_public_card() gains offer_text so the public card page can render the
-- promise itself, not just the stamp count. DROP first, not `create or
-- replace`: adding an OUT column changes the function's return type, which
-- Postgres rejects with 42P13 (hit this exact error in 0012 already).
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
