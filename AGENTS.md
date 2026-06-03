# AGENTS.md

## Commands
- `npm run dev` — start frontend dev server (Vite, port 5173)
- `cd server && npm start` — start payment + orders API (port 3001)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build locally

## Stack
- **Frontend**: React 19 + Vite, Tailwind CSS v4 (`@tailwindcss/vite` plugin), React Router v6
- **State**: Zustand (cart + auth stores in `src/lib/store.js`)
- **Data**: TanStack Query + Supabase (`src/lib/supabase.js`)
- **Payments + Orders API**: Express server in `server/` (Stripe Checkout Sessions, order CRUD)
- **Database**: Supabase (Postgres)

## Environment
Copy `.env.example` → `.env` and set:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — required for auth + data
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_SECRET_KEY` — Stripe secret key (server)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (server)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server, bypasses RLS)
- `CLIENT_URL` — e.g. `http://localhost:5173`
- `VITE_API_URL` — e.g. `http://localhost:3001`

## Supabase Required Tables
- `products` — id, name, price, category, image_url, stock, description, rating, discount, created_at
- `orders` — id, user_id, items (jsonb), total, status, shipping_address, payment_intent, created_at
- `reviews` — id, product_id, user_id, rating (1-5), comment, created_at
- `wishlists` — id, user_id, product_id, created_at (unique on user+product)

## Auth
- Supabase auth (email/password). Routes protected via `<ProtectedRoute>` in `src/components/`.
- Admin dashboard at `/dashboard`; requires `user.role === 'admin'`.

## Server API (Express, port 3001)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/create-checkout-session` | Creates Stripe Checkout Session, returns redirect URL |
| POST | `/api/webhook` | Stripe webhook — confirms payment, inserts order |
| GET | `/api/orders?userId=X` | List orders (filter by userId) |
| PUT | `/api/orders/:id` | Update order status (admin) |
| GET | `/api/orders/stats` | Revenue + order counts (admin) |

## Directory Layout
```
server/           — Express API (Stripe + orders)
src/
  lib/            — supabase, stripe, zustand store
  components/     — Navbar, Footer, ProductCard, ProtectedRoute, Reviews
  pages/          — Home, Products, ProductDetail, Cart, Checkout, OrderConfirmation, Orders, Login, Register, Dashboard
  App.jsx         — BrowserRouter + route definitions
  main.jsx        — entry point with QueryClientProvider
```

## Style
Tailwind utility classes only (no CSS modules, no styled-components). Gradient hero on Home page uses `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500`.

## Notable
- `lang="ar" dir="rtl"` in `index.html`
- Featured products on Home page are hardcoded demo data; real data comes from Supabase on Products page
- Checkout uses real Stripe Checkout Sessions (redirects to Stripe's hosted page)
- Orders API must be running separately (`cd server && npm start`)
- For production, deploy server to Railway/Render/Heroku and set `VITE_API_URL`
- Dashboard has two tabs: Products (CRUD) and Orders (status management + sales stats)
