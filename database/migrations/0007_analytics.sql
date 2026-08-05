-- Digital Loyalty Wallet SaaS
-- Phase 8: Analytics
-- No new tables — aggregates over existing customers/transactions/rewards.
-- See docs/loyalty-wallet-saas/09_Development_Roadmap.md (Phase 8)
--
-- All three are SECURITY INVOKER (the default): they run as the calling
-- business_owner, so the existing RLS policies on transactions/rewards/
-- customers (owner-scoped) apply naturally — no manual ownership check
-- needed here, unlike the SECURITY DEFINER functions in earlier phases.

-- ---------------------------------------------------------------------------
-- get_top_rewards(): most-redeemed rewards, requires a GROUP BY the
-- supabase-js client can't express directly.
-- ---------------------------------------------------------------------------

create or replace function public.get_top_rewards(p_business_id uuid, p_limit integer default 5)
returns table (reward_id uuid, reward_name text, redemption_count bigint)
language sql
stable
as $$
  select r.id, r.name, count(t.id)
  from public.transactions t
  join public.rewards r on r.id = t.reward_id
  where t.business_id = p_business_id and t.reward_id is not null
  group by r.id, r.name
  order by count(t.id) desc
  limit p_limit;
$$;

grant execute on function public.get_top_rewards(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- get_customer_growth(): new customers per week, last N weeks (zero-filled
-- for weeks with no signups).
-- ---------------------------------------------------------------------------

create or replace function public.get_customer_growth(p_business_id uuid, p_weeks integer default 8)
returns table (week_start date, new_customers bigint)
language sql
stable
as $$
  select gs.week_start::date, count(c.id)
  from generate_series(
    date_trunc('week', current_date) - ((p_weeks - 1) || ' weeks')::interval,
    date_trunc('week', current_date),
    interval '1 week'
  ) as gs(week_start)
  left join public.customers c
    on c.business_id = p_business_id
    and date_trunc('week', c.created_at) = gs.week_start
  group by gs.week_start
  order by gs.week_start;
$$;

grant execute on function public.get_customer_growth(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- get_return_rate(): % of customers with more than one visit.
-- ---------------------------------------------------------------------------

create or replace function public.get_return_rate(p_business_id uuid)
returns numeric
language sql
stable
as $$
  select case when count(*) = 0 then 0
    else round(100.0 * count(*) filter (where total_visits > 1) / count(*), 1)
  end
  from public.customers
  where business_id = p_business_id;
$$;

grant execute on function public.get_return_rate(uuid) to authenticated;
