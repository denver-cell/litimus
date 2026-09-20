# Litimus

AI text detection SaaS. This folder holds the current frontend and backend for the project.

The GitHub repo (`denver-cell/litimus`) previously contained only a single static
`index.html` landing page (with a fully client-side heuristic detector already built
into it). This folder rebuilds that into two proper Next.js apps — a `frontend`
(the site + app UI) and a `backend` (`litmus-backend`, the API) — while preserving
the existing design, copy, and detector logic from that page.

## Structure

```
litimus-project/
├── frontend/    Next.js 14 (App Router) — the public site, auth pages, dashboard
├── backend/     Next.js 14 (App Router) — "litmus-backend", API-only (Netlify Functions)
└── docs/        extra notes
```

Both apps deploy to Netlify separately (as the earlier chat/memory notes describe:
Netlify for both, not Vercel) — `frontend` at `litimus.app`, `backend` at something
like `api.litimus.app`, wired together via `NEXT_PUBLIC_BACKEND_URL` in the frontend's
env.

## Frontend (`frontend/`)

- Ports the existing landing page 1:1: hero, in-browser detector (client-side heuristic
  scoring, `.txt`/`.docx`/`.pdf` upload, PDF report download), "how it works", signals
  explainer, honesty section, pricing, FAQ.
- Adds `/pricing`, `/login`, `/signup`, `/dashboard` (Supabase Auth) that didn't exist
  in the static page.
- The free, anonymous scan in the hero detector still runs entirely client-side
  (`lib/analyze.ts`) — nothing is sent to a server for that path, matching the
  original page's "processed in your browser" promise.
- The dashboard calls the backend's `/api/usage` (and, going forward, `/api/detect`)
  for authenticated scans that count against a metered daily plan limit.

Run locally:

```
cd frontend
cp .env.example .env.local   # fill in Supabase + backend URL
npm install
npm run dev
```

## Backend (`backend/`, a.k.a. `litmus-backend`)

API-only Next.js app (App Router route handlers), meant to deploy as Netlify
Functions via `@netlify/plugin-nextjs`.

- `POST /api/detect` — server-side scan (same heuristic engine as the frontend, kept
  in sync manually — see the comment at the top of `lib/analyze.ts`), enforces the
  daily word limit per plan, records usage.
- `GET /api/usage` — current plan + today's word usage for the logged-in user.
- `POST /api/billing/paddle/webhook` — Paddle's webhook. This is the only place a
  plan upgrade or day pass actually gets granted. Checkout itself (plans and the day
  pass alike) is started entirely client-side via Paddle.js — see
  `frontend/lib/paddle.ts` — so there's no backend "start checkout" endpoint; this
  webhook is the only thing the backend has to do with payments.
- `POST /api/auth/verify-student` — stub integration point for a third-party student
  verification provider (SheerID/UNiDAYS-style); currently auto-approves and needs a
  real provider wired in before launch.

Usage limiting and plan enforcement live in `lib/usageLimiter.ts` + `lib/pricing.ts`,
against Supabase tables defined in `supabase/schema.sql`.

Run locally:

```
cd backend
cp .env.example .env.local   # fill in Supabase service role key + Paddle webhook secret/price ids
npm install
npm run dev   # serves on :3001
```

## Supabase setup

1. Create a Supabase project.
2. Run `backend/supabase/schema.sql` in the SQL editor. It creates:
   - `profiles` (plan, student verification) — auto-populated on signup via a trigger
   - `usage_daily` (per-user or per-hashed-IP daily word counts)
   - `day_passes` (active $5 top-ups)
   - `subscriptions` (recurring billing state + Paddle customer/subscription ids, mirrored
     from Paddle's webhooks)
   - RLS policies so users can read their own rows; all writes happen server-side via
     the service role key, which bypasses RLS.
3. Put the project URL + anon key in `frontend/.env.local`, and the project URL +
   **service role key** (server-only, never exposed to the browser) in
   `backend/.env.local`.

## Payments (Paddle)

Paddle is our merchant of record — it bills in real USD, handles global VAT/tax, and
owns the customer relationship for payments, unlike PayFast which was just a payment
processor. Checkout happens entirely client-side: `frontend/lib/paddle.ts` opens
Paddle.js's checkout overlay directly with a price id (`NEXT_PUBLIC_PADDLE_PRICE_*`),
no backend round-trip needed to start a payment. `backend/lib/paddle.ts` implements
Paddle's webhook signature scheme (HMAC-SHA256 over `${ts}:${rawBody}`, matching the
`Paddle-Signature` header) and the plan↔price-id lookup used to interpret incoming
webhook events in `app/api/billing/paddle/webhook/route.ts` — the only place a plan
upgrade or day pass is actually granted. Set `NEXT_PUBLIC_PADDLE_ENV=sandbox` on the
frontend while testing against a Paddle sandbox account (the backend's webhook
handler doesn't need to know sandbox vs. production — it only verifies a signature),
and create matching sandbox price ids for student/pro/team/day-pass in the Paddle
dashboard before this will actually work end-to-end.

## What's still a placeholder / roadmap

- **Detection engine**: both apps currently use the same rule-based heuristic scorer
  that was already in the original landing page (sentence-length burstiness,
  vocabulary spread, stock AI phrases, repeated trigrams, em-dash rate). The earlier
  project notes describe eventually moving to perplexity-based scoring against a
  small language model, then a trained classifier — `lib/analyze.ts` in each app is
  the place to swap that in; keep the two copies in sync until this becomes a shared
  package.
- **Student verification**: `verify-student/route.ts` auto-approves; needs a real
  SheerID/UNiDAYS-style provider integrated.
- **Paddle go-live**: sandbox integration only so far — needs real (non-sandbox) Paddle
  account approval, live price ids swapped in, and the webhook's notification
  destination pointed at the real backend URL before this can take real payments.
- **Student plan verification isn't actually enforced at checkout** (see the NOTE in
  `verify-student/route.ts`) — anyone can currently buy the Student plan regardless of
  `student_verified_until`.
- **CORS on the backend** is wide open (`Access-Control-Allow-Origin: *`) for early
  development — restrict to the real frontend origin(s) before launch.
