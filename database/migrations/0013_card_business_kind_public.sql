-- Digital Loyalty Wallet SaaS
-- Phase 10 follow-up: expose card_business_kind on the public card RPC.
--
-- The stamp grid on /c/[id] needs to know the business's trade to pick a
-- matching stamp icon (a cup for a cafe, a hanger for a laundry) and unit
-- label ("القهوة" vs "الغسلات") — card_theme alone (added in 0012) is not
-- enough. Same DROP-then-CREATE requirement as 0012: adding an OUT column
-- changes the function's return type, which `create or replace` rejects
-- with 42P13.

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
