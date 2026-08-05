-- Digital Loyalty Wallet SaaS
-- Phase 10: AI-generated card identity.
--
-- Stored on business_settings rather than its own table: a business has exactly
-- one active card design, and every read of it already loads business_settings
-- (the card page, the wallet sync, the dashboard). A separate table would add a
-- join to all three for a strict 1:1.
--
-- The theme is a small jsonb document rather than one column per field, so
-- adding a property later (a pattern, a second accent) is an app change instead
-- of a migration. It is validated by a Zod schema on write — see
-- lib/card-design/theme.ts — and every read passes through sanitizeTheme(),
-- which is what actually guarantees the balance stays readable.

alter table public.business_settings
  add column if not exists card_theme jsonb,
  add column if not exists card_business_kind text,
  add column if not exists card_theme_generated_at timestamptz;

-- get_public_card() gains the theme so /c/[id] can render the customer's card
-- in their shop's identity. Still display-only: no phone, no email, no owner
-- info — the same contract as 0005.
create or replace function public.get_public_card(p_wallet_card_id uuid)
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
  card_theme jsonb
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
    bs.card_theme
  from public.wallet_cards wc
  join public.customers c on c.id = wc.customer_id
  join public.businesses b on b.id = wc.business_id
  left join public.business_settings bs on bs.business_id = b.id
  left join public.loyalty_programs lp on lp.business_id = b.id and lp.is_active
  where wc.id = p_wallet_card_id;
$$;

grant execute on function public.get_public_card(uuid) to anon, authenticated;
