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
- `POST /api/daypass` — starts a PayFast checkout for the $3 one-time day pass.
- `POST /api/billing/payfast/checkout` — starts a PayFast checkout for a paid plan
  (student/pro/team).
- `POST /api/billing/payfast/notify` — PayFast's ITN webhook. This is the only place
  a plan upgrade or day pass actually gets granted — checkout endpoints only start
  payment, never grant anything themselves.
- `POST /api/auth/verify-student` — stub integration point for a third-party student
  verification provider (SheerID/UNiDAYS-style); currently auto-approves and needs a
  real provider wired in before launch.

Usage limiting and plan enforcement live in `lib/usageLimiter.ts` + `lib/pricing.ts`,
against Supabase tables defined in `supabase/schema.sql`.

Run locally:

```
cd backend
cp .env.example .env.local   # fill in Supabase service role key + PayFast sandbox creds
npm install
npm run dev   # serves on :3001
```

## Supabase setup

1. Create a Supabase project.
2. Run `backend/supabase/schema.sql` in the SQL editor. It creates:
   - `profiles` (plan, student verification) — auto-populated on signup via a trigger
   - `usage_daily` (per-user or per-hashed-IP daily word counts)
   - `day_passes` (active $3 top-ups)
   - `subscriptions` (recurring billing state + PayFast token, mirrored from the ITN webhook)
   - RLS policies so users can read their own rows; all writes happen server-side via
     the service role key, which bypasses RLS.
3. Put the project URL + anon key in `frontend/.env.local`, and the project URL +
   **service role key** (server-only, never exposed to the browser) in
   `backend/.env.local`.

## Payments (PayFast)

`backend/lib/payfast.ts` implements PayFast's MD5 signature scheme and the two-step
ITN validation they require (recompute signature, then post the raw payload back to
PayFast's `/eng/query/validate` endpoint) before trusting any payment. Prices in
`checkout/route.ts` and `daypass/route.ts` are placeholders in ZAR — replace with real,
FX-checked amounts before launch. Set `PAYFAST_SANDBOX=true` while testing against
PayFast's sandbox merchant credentials.

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
- **PayFast pricing**: placeholder ZAR amounts; needs real FX-checked pricing and
  PayFast's recurring-billing ("subscription") token flow fully wired (currently only
  a one-off checkout + webhook-side profile update, no automatic monthly re-charge
  handling beyond what PayFast's own subscription product provides).
- **CORS on the backend** is wide open (`Access-Control-Allow-Origin: *`) for early
  development — restrict to the real frontend origin(s) before launch.
