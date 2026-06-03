# AGENTS.md

## Commands
- `npm run dev` — start dev server (Vite)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build locally

## Stack
- **Frontend**: React 19 + Vite, Tailwind CSS v4 (`@tailwindcss/vite` plugin), React Router v6
- **State**: Zustand (cart + auth stores in `src/lib/store.js`)
- **Data**: TanStack Query + Supabase (`src/lib/supabase.js`)
- **Payments**: Stripe (`src/lib/stripe.js`)

## Environment
Copy `.env.example` → `.env` and set:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — required for auth + data
- `VITE_STRIPE_PUBLISHABLE_KEY` — optional, for checkout

## Supabase Required Tables
- `products` — id, name, price, category, image_url, stock, description, rating, discount, created_at
- `orders` — id, user_id, items (jsonb), total, status, created_at
- `profiles` — id (uuid, FK auth.users), role (default 'customer'), email

## Auth
- Supabase auth (email/password). Routes protected via `<ProtectedRoute>` in `src/components/`.
- Admin dashboard at `/dashboard`; requires `user.role === 'admin'`.

## Directory Layout
```
src/
  lib/          — supabase, stripe, zustand store
  components/   — Navbar, Footer, ProductCard, ProtectedRoute
  pages/        — Home, Products, ProductDetail, Cart, Checkout, Login, Register, Dashboard
  App.jsx       — BrowserRouter + route definitions
  main.jsx      — entry point with QueryClientProvider
```

## Style
Tailwind utility classes only (no CSS modules, no styled-components). Gradient hero on Home page uses `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500`.

## Notable
- `lang="ar" dir="rtl"` in `index.html`
- Stripe card form is a placeholder (dummy inputs); real integration requires Stripe Elements
- Featured products on Home page are hardcoded demo data; real data comes from Supabase on Products page
- Products page queries Supabase directly (not TanStack Query) for simplicity
