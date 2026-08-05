<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Digital Loyalty Wallet SaaS

Multi-tenant SaaS platform for digital loyalty cards (Apple Wallet / Google
Wallet). Full specification lives in `docs/loyalty-wallet-saas/`. This is
Phase 1 of the roadmap in `docs/loyalty-wallet-saas/09_Development_Roadmap.md`:
authentication + the `profiles` / `businesses` tables only. Everything else
(customers, loyalty engine, rewards, wallet integration, employees,
subscriptions) is still to be built in later phases.

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
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, not used yet — reserved for
  future admin-only operations)

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
  employee/                   — employee landing page (stub)
  admin/                      — platform admin landing page (stub)
lib/
  supabase/client.ts          — browser Supabase client
  supabase/server.ts          — server Supabase client (cookies)
  supabase/proxy.ts           — session refresh + route gating, used by proxy.ts
  auth/session.ts             — getCurrentUser(), getOwnedBusiness()
  auth/require-role.ts        — server-side role guard for pages
  auth/redirect-for-role.ts   — where to send a user after login, by role
types/database.ts             — hand-written Supabase Database type
  (Row/Insert/Update MUST use `type`, not `interface` — an interface fails
  the GenericTable structural check and silently degrades inserts to `never`)
database/migrations/          — plain SQL migrations, applied manually
docs/loyalty-wallet-saas/     — full product/technical spec (source of truth)
```

## Roles

`admin` | `business_owner` | `employee` | `customer` — stored on
`profiles.role`. `requireRole()` redirects unauthenticated users to
`/auth/login` and wrong-role users to their own landing page
(`redirectPathForProfile`).

## Notes

- `proxy.ts` matcher excludes static assets; it redirects unauthenticated
  requests to non-public paths to `/auth/login?next=<path>`.
- Public paths (no auth required): `/`, `/auth/login`, `/auth/register`,
  `/auth/check-email`.
- A business owner with no `businesses` row yet is routed to
  `/onboarding/business` (both by the login action and by `/dashboard`
  itself as a safety net).
