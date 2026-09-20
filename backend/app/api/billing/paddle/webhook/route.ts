import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, planForPriceId } from "@/lib/paddle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DAY_PASS_WORDS, DAY_PASS_VALID_HOURS } from "@/lib/pricing";

export const runtime = "nodejs";

// Paddle's webhook — the ONLY place a plan change or day pass is actually
// granted. Checkout (frontend/lib/paddle.ts, via Paddle.js) talks straight
// to Paddle and never touches this backend; this route is how we hear back.
// Configure the notification destination URL in the Paddle dashboard as
// {BACKEND_PUBLIC_URL}/api/billing/paddle/webhook, subscribed to at least
// subscription.created, subscription.updated, subscription.canceled, and
// transaction.completed.
// https://developers.paddle.com/webhooks/overview
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Paddle webhook received but PADDLE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  if (!verifyWebhookSignature(rawBody, req.headers.get("paddle-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const admin = supabaseAdmin();

  switch (event.event_type) {
    // A subscription's state (including its price/plan) can change at any
    // point in its life — created, upgraded/downgraded, past due after a
    // failed renewal, resumed — so both events are handled identically:
    // just mirror whatever Paddle says the subscription's status/plan is
    // right now onto profiles.plan.
    case "subscription.created":
    case "subscription.updated": {
      const sub = event.data;
      const userId = sub.custom_data?.user_id as string | undefined;
      const priceId = sub.items?.[0]?.price?.id as string | undefined;
      const plan = priceId ? planForPriceId(priceId) : null;

      if (!userId || !plan || plan === "daypass") {
        console.error("Paddle subscription event missing/unrecognized user_id or price id", {
          subscriptionId: sub.id,
          userId,
          priceId,
        });
        break;
      }

      const active = sub.status === "active" || sub.status === "trialing";
      const profileWrite = await admin
        .from("profiles")
        .upsert({ id: userId, plan: active ? plan : "free" }, { onConflict: "id" });
      const subWrite = await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          plan,
          status: active ? "active" : sub.status === "past_due" ? "past_due" : "cancelled",
          paddle_customer_id: sub.customer_id ?? null,
          paddle_subscription_id: sub.id ?? null,
          current_period_end: sub.current_billing_period?.ends_at ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      // Return 500 (not the swallowed-error default) so Paddle retries —
      // otherwise a failed write here is invisible: Paddle sees 200 and
      // never resends, and the plan change just silently never happens.
      if (profileWrite.error || subWrite.error) {
        console.error("Failed to apply Paddle subscription update:", {
          subscriptionId: sub.id,
          userId,
          profileError: profileWrite.error,
          subscriptionError: subWrite.error,
        });
        return NextResponse.json({ error: "Could not apply subscription update" }, { status: 500 });
      }
      break;
    }

    case "subscription.canceled": {
      const sub = event.data;
      const userId = sub.custom_data?.user_id as string | undefined;
      if (!userId) break;

      const profileWrite = await admin.from("profiles").upsert({ id: userId, plan: "free" }, { onConflict: "id" });
      const subWrite = await admin
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (profileWrite.error || subWrite.error) {
        console.error("Failed to apply Paddle subscription cancellation:", {
          subscriptionId: sub.id,
          userId,
          profileError: profileWrite.error,
          subscriptionError: subWrite.error,
        });
        return NextResponse.json({ error: "Could not apply subscription cancellation" }, { status: 500 });
      }
      break;
    }

    // Fires for every payment, including subscription renewals — only act
    // on the one-off day-pass purchase; subscription lifecycle is handled
    // entirely by the subscription.* events above.
    case "transaction.completed": {
      const txn = event.data;
      if (txn.subscription_id) break;

      const priceId = txn.items?.[0]?.price?.id as string | undefined;
      const plan = priceId ? planForPriceId(priceId) : null;
      if (plan !== "daypass") break;

      const userId = txn.custom_data?.user_id as string | undefined;
      if (!userId) {
        console.error("Paddle day pass transaction missing custom_data.user_id", { transactionId: txn.id });
        break;
      }

      // paddle_transaction_id is unique-constrained (see
      // supabase/migrations/0001_paddle.sql) so a retried webhook for the
      // same transaction can't double-grant words.
      const { error } = await admin.from("day_passes").insert({
        user_id: userId,
        words_granted: DAY_PASS_WORDS,
        expires_at: new Date(Date.now() + DAY_PASS_VALID_HOURS * 60 * 60 * 1000).toISOString(),
        paddle_transaction_id: txn.id,
      });
      if (error && error.code !== "23505") {
        // 23505 = unique_violation, i.e. we've already processed this
        // transaction (Paddle retries any non-2xx response) — not an error.
        console.error("Failed to grant day pass from Paddle transaction:", error);
        return NextResponse.json({ error: "Could not record day pass" }, { status: 500 });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
