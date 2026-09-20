-- Migrates billing state from PayFast to Paddle. Additive only — the old
-- PayFast columns are left in place (unused going forward, kept for
-- historical/audit reference) rather than dropped, so this is safe to run
-- against the live project with existing rows. Run in the Supabase SQL
-- editor, or via `supabase db push`.

alter table public.subscriptions
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text;

create unique index if not exists subscriptions_paddle_subscription_idx
  on public.subscriptions (paddle_subscription_id) where paddle_subscription_id is not null;

-- Fixes a real bug in the PayFast ITN handler: day_passes had no unique
-- constraint on the payment reference, so a retried webhook notification
-- could double-grant +10,000 words. paddle_transaction_id is unique from
-- day one on the Paddle side.
alter table public.day_passes
  add column if not exists paddle_transaction_id text;

create unique index if not exists day_passes_paddle_transaction_idx
  on public.day_passes (paddle_transaction_id) where paddle_transaction_id is not null;
