<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Digital Loyalty Wallet SaaS

Multi-tenant SaaS platform for digital loyalty cards (Apple Wallet / Google
Wallet). Full specification lives in `docs/loyalty-wallet-saas/`. Phases 1-8
of the roadmap in `docs/loyalty-wallet-saas/09_Development_Roadmap.md` are
implemented: authentication, business dashboard, the loyalty/points engine,
customer management, rewards, wallet integration (PassKit adapter),
subscriptions/plan limits, and analytics. Employees (as actual accounts,
not just the "Employee Mode" quick-add UI), real billing/payment
collection, and Phase 9's production-launch checklist are still to be
built.

## Commands

- `npm run dev` — start dev server (Turbopack, port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm start` — run production build

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Auth**: `@supabase/ssr`, cookie-based sessions, Server Actions for
  mutations (`'use server'`)
- Route protection lives in `proxy.ts` (Next 16 renamed `middleware.ts` to
  `proxy.ts` — see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`)

## Environment

Copy `.env.example` → `.env.local` and fill in a Supabase project's API
settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, bypasses RLS — used only by
  `lib/supabase/service.ts`, and only from `lib/wallet/provider-registry.ts`
  to read `wallet_provider_settings` from inside a business_owner's server
  action; never import it anywhere else)

Run `database/migrations/0001_init.sql` against the Supabase project (SQL
editor or `supabase db push`) before using the app — it creates `profiles`
and `businesses`, RLS policies, and the `handle_new_user` trigger that
auto-creates a profile row on signup.

## Directory layout

```
app/
  page.tsx                    — landing page
  auth/register/              — owner signup (creates auth user + profile)
  auth/login/                 — login, logout action
  auth/check-email/           — shown when email confirmation is required
  onboarding/business/        — first-login step: create the business row
  dashboard/                  — business_owner + customer landing page
    settings/                 — business_owner: edit business + colors/lang/tz
    profile/                  — any role: edit own full_name/phone
    loyalty-program/          — business_owner: create/edit the earning rules
    customers/                — business_owner: list + search customers
    customers/new/            — add a customer (accepts ?phone= prefill)
    customers/[id]/           — profile: edit, transaction history, add points
    quick-add/                — "Employee Mode": search by phone → add points
                                 or redeem a reward
    rewards/                  — business_owner: list + create rewards
    rewards/new/               — create a reward
    rewards/[id]/              — edit/delete a reward
    subscription/              — business_owner: current plan, trial
                                  countdown, usage vs. limit, plan comparison
    analytics/                 — business_owner: return rate, customer
                                  growth chart, top customers, top rewards
  admin/                      — platform admin landing page (stub)
    wallet-provider/           — admin: configure/test the wallet provider
    businesses/                — admin: list all businesses + subscriptions
    businesses/[id]/           — admin: manually set plan/status/end_date
                                  (stands in for real billing — see below)
  employee/                   — employee landing page (stub)
  c/[id]/                     — PUBLIC: customer's wallet card (Add to
                                 Apple/Google Wallet), no auth, id is the
                                 wallet_cards row id used as an unguessable
                                 "secure token" (see 06_Wallet_Integration.md
                                 section 15)
lib/
  supabase/client.ts          — browser Supabase client
  supabase/server.ts          — server Supabase client (cookies, RLS-scoped
                                 to the logged-in user)
  supabase/service.ts         — service-role client, bypasses RLS; only
                                 imported from lib/wallet/provider-registry.ts
  supabase/proxy.ts           — session refresh + route gating, used by proxy.ts
  auth/session.ts             — getCurrentUser(), getOwnedBusiness(),
                                 getBusinessById(), getBusinessSettings(),
                                 getLoyaltyProgram(), getBusinessStats(),
                                 getCustomers(), getCustomerByPhone(),
                                 getCustomer(), getCustomerTransactions(),
                                 getRewards(), getReward(), getWalletCard(),
                                 getActiveWalletProviderSettings(),
                                 getSubscription(),
                                 getEffectiveSubscriptionStatus(),
                                 getSubscriptionPlans(),
                                 getAllBusinessesWithSubscriptions(),
                                 getTopCustomers(), getTopRewards(),
                                 getCustomerGrowth(), getReturnRate()
  auth/require-role.ts        — server-side role guard for pages
  auth/redirect-for-role.ts   — where to send a user after login, by role
  wallet/types.ts              — WalletProvider interface (createCard,
                                  updateCard, deleteCard, getStatus,
                                  testConnection) — provider-agnostic
  wallet/provider-registry.ts  — reads the active provider config, returns
                                  a WalletProvider instance
  wallet/sync.ts                — syncWalletCard(): best-effort create/update,
                                   never throws, records failures on the
                                   wallet_cards row instead
  wallet/providers/passkit.ts   — PassKit REST adapter (Members API, JWT
                                   auth signed with node:crypto HMAC)
types/database.ts             — hand-written Supabase Database type
  (Row/Insert/Update MUST use `type`, not `interface` — an interface fails
  the GenericTable structural check and silently degrades inserts to `never`)
database/migrations/          — plain SQL migrations, applied manually
  0001_init.sql                — profiles, businesses
  0002_business_settings.sql   — business_settings (colors, language, tz)
  0003_loyalty_engine.sql      — loyalty_programs, customers, loyalty_cards,
                                  transactions + record_points_transaction()
                                  RPC (single write path for points, enforces
                                  a 30s anti-fraud throttle per customer+type)
  0004_rewards.sql             — rewards + transactions.reward_id +
                                  redeem_reward() RPC (validates points/stock
                                  server-side, delegates to
                                  record_points_transaction()); replaces
                                  record_points_transaction() to add the
                                  optional p_reward_id param
  0005_wallet_integration.sql   — wallet_provider_settings (admin-only RLS),
                                   wallet_cards, business_settings
                                   .passkit_program_id/.passkit_tier_id,
                                   on_customer_created trigger (auto-
                                   provisions a wallet_cards row),
                                   get_public_card() RPC (the only public,
                                   anon-readable path — returns display
                                   fields only, never phone/email)
  0006_subscriptions.sql        — subscription_plans (seeded: starter/
                                   professional/enterprise), subscriptions,
                                   on_business_created trigger (auto-starts
                                   a 14-day starter trial),
                                   get_effective_subscription_status() RPC
                                   (lazy trial expiry — a trial past its
                                   end_date reads as 'expired' without a
                                   background job flipping the row),
                                   check_customer_limit() trigger (blocks
                                   customers.insert once over plan limit or
                                   once status is expired/cancelled)
  0007_analytics.sql            — no new tables; get_top_rewards(),
                                   get_customer_growth(), get_return_rate()
                                   RPCs — SECURITY INVOKER (the default, not
                                   DEFINER like earlier phases), so existing
                                   RLS on transactions/rewards/customers
                                   applies naturally with no manual
                                   ownership check needed
docs/loyalty-wallet-saas/     — full product/technical spec (source of truth)
```

## Points engine

All point mutations (earn/redeem/adjustment/refund) go through the
`record_points_transaction()` Postgres function, never direct table writes —
see the note in `0003_loyalty_engine.sql` (redefined in `0004_rewards.sql` to
add `p_reward_id`). It re-checks business ownership itself (SECURITY
DEFINER), rejects a second same-type transaction for the same customer
within 30 seconds, and keeps `customers.total_points` /
`loyalty_cards.current_points` in sync with the `transactions` ledger.
Reward redemptions go through `redeem_reward()` instead of calling
`record_points_transaction()` directly — it validates the customer has
enough points and the reward is active/in stock, then delegates to
`record_points_transaction()` for the actual ledger write.

Customer management (`/dashboard/customers`), the "Employee Mode" quick
add-points/redeem-reward flow (`/dashboard/quick-add`, search by phone), and
reward management (`/dashboard/rewards`) are business_owner-only for now —
actual `employee` role accounts (invites, permissions) are not built yet.

## Wallet integration

Provider-agnostic by design (`lib/wallet/types.ts` `WalletProvider`
interface) per `06_Wallet_Integration.md` — swapping providers later means
adding a new `lib/wallet/providers/*.ts` and one line in
`provider-registry.ts`, nothing else changes.

- **Platform-wide, not per-business**: one active provider config
  (`wallet_provider_settings`), set by the platform `admin` at
  `/admin/wallet-provider`. RLS restricts that table to `admin`; the sync
  logic reads it via the service-role client (`lib/supabase/service.ts`)
  since it runs inside business_owner actions.
- **Per-business pass template**: each business owner creates their own
  Program + Tier (the actual pass design) in the provider's own dashboard —
  this app never generates or designs a pass — and enters the resulting IDs
  in `/dashboard/settings` (`passkit_program_id` / `passkit_tier_id`). Sync
  fails with a clear message until both are set.
- **Auto-provisioning**: the `on_customer_created` trigger inserts a
  `wallet_cards` row (`sync_status = 'created'`) the moment a customer is
  created; `syncWalletCard()` is then called from `createCustomer`,
  `addPointsTransaction`, and `redeemRewardForCustomer` to push an
  create/update to the provider. It never throws — a failure just leaves
  `wallet_cards.sync_status = 'failed'` with `last_error` set, and the owner
  can retry from the customer profile page ("إعادة المزامنة"). This is a
  simplified stand-in for the roadmap's automated-retry/event-queue design
  (section 11-12) — there's no background worker in this stack, so retries
  are manual rather than exponential-backoff-on-a-timer.
- **Public card page** (`/c/[id]`): the only way an unauthenticated visitor
  reads card data — via `get_public_card()`, a `SECURITY DEFINER` RPC
  granted to `anon`/`authenticated` that returns only display fields
  (business name/logo/colors, customer name, points, reward threshold,
  wallet URLs). `[id]` is the `wallet_cards.id`, acting as the QR code's
  "secure token".
- The PassKit adapter (`lib/wallet/providers/passkit.ts`) is written against
  their published OpenAPI spec, but two things are unverified against a
  real account (documented as comments in the file): the JWT
  `Authorization` header format, and the pass-install-URL construction
  (`https://pub1.pskt.io/{memberId}.pkpass` / `.gpay}` — not returned by any
  API response). Confirmed empirically during Phase 6 testing: a real
  PassKit account returned a structured `401 Unauthenticated` (not a
  malformed-request error), confirming the JWT format and endpoint shape
  are correct — full success still needs a real Program/Tier/API key.

## Subscriptions

Billing (actual payment collection) is **not** built — same
external-provider-decision pattern as Phase 6, deliberately deferred pending
a choice of payment processor (Stripe or similar) since it involves real
money, business banking details, and compliance considerations beyond a
simple API-key setup. What exists instead:

- Every business gets a 14-day `starter`-plan trial automatically
  (`on_business_created` trigger) — no signup flow choice needed.
- Plan limits (`subscription_plans.customer_limit`) are enforced at the DB
  level via `check_customer_limit()`, not just in the UI — inserting a
  customer past the limit, or while the subscription is `expired`/
  `cancelled`, fails with a clear Arabic error surfaced in
  `createCustomer`'s form.
- A trial past its `end_date` is lazily treated as `expired` by
  `get_effective_subscription_status()` — nothing physically flips the row
  on a timer (no background worker in this stack, same tradeoff as wallet
  sync retries).
- Until real billing exists, `admin` manually sets a business's
  plan/status/end_date at `/admin/businesses/[id]` — this is the interim
  "billing ops" path, not a permanent design.

## Roles

`admin` | `business_owner` | `employee` | `customer` — stored on
`profiles.role`. `requireRole()` redirects unauthenticated users to
`/auth/login` and wrong-role users to their own landing page
(`redirectPathForProfile`).

## Notes

- `proxy.ts` matcher excludes static assets; it redirects unauthenticated
  requests to non-public paths to `/auth/login?next=<path>`.
- Public paths (no auth required): `/`, `/auth/login`, `/auth/register`,
  `/auth/check-email`, and any `/c/*` path (the public wallet card page).
- A business owner with no `businesses` row yet is routed to
  `/onboarding/business` (both by the login action and by `/dashboard`
  itself as a safety net).
