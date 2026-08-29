import { NextRequest, NextResponse } from "next/server";
import { verifySignature, payfastHost } from "@/lib/payfast";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DAY_PASS_WORDS, DAY_PASS_VALID_HOURS } from "@/lib/pricing";

export const runtime = "nodejs";

// PayFast's Instant Transaction Notification (ITN) webhook. Called
// server-to-server by PayFast once a payment completes — this is the
// ONLY place a plan upgrade or day pass is actually granted; the
// checkout endpoints above just start the payment, they never grant
// anything themselves.
//
// PayFast's own recommended validation has three parts, all done here:
//   1. Recompute and compare the signature.
//   2. Post the raw payload back to PayFast's `validate` endpoint and
//      confirm it echoes back "VALID".
//   3. Check payment_status === "COMPLETE" before acting.
// https://developers.payfast.co.za/docs#step_3_confirm_payment
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const fields: Record<string, string> = {};
  params.forEach((value, key) => {
    fields[key] = value;
  });

  if (!verifySignature(fields)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const validateRes = await fetch(`https://${payfastHost()}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
    });
    const validateText = (await validateRes.text()).trim();
    if (validateText !== "VALID") {
      return NextResponse.json({ error: "PayFast could not validate this notification" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Could not reach PayFast to validate notification" }, { status: 502 });
  }

  if (fields.payment_status !== "COMPLETE") {
    // ITN also fires for FAILED/PENDING — acknowledge with 200 so PayFast
    // doesn't retry, but don't grant anything.
    return NextResponse.json({ ok: true, ignored: fields.payment_status });
  }

  const userId = fields.custom_str1;
  const plan = fields.custom_str2;
  if (!userId || !plan) {
    return NextResponse.json({ error: "Missing custom_str1/custom_str2 on notification" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  if (plan === "daypass") {
    await admin.from("day_passes").insert({
      user_id: userId,
      words_granted: DAY_PASS_WORDS,
      expires_at: new Date(Date.now() + DAY_PASS_VALID_HOURS * 60 * 60 * 1000).toISOString(),
      payfast_payment_id: fields.pf_payment_id || null,
    });
  } else if (["student", "pro", "team"].includes(plan)) {
    await admin
      .from("profiles")
      .upsert({ id: userId, plan }, { onConflict: "id" });

    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: "active",
        payfast_token: fields.token || null,
        current_period_end: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ ok: true });
}
