import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { buildCheckoutFields, payfastHost } from "@/lib/payfast";

export const runtime = "nodejs";

const PLAN_PRICES_ZAR: Record<string, { amount: string; label: string }> = {
  student: { amount: "74.00", label: "Litimus Student — monthly" },
  pro: { amount: "275.00", label: "Litimus Pro — monthly" },
  team: { amount: "899.00", label: "Litimus Team & API — monthly, 5 seats" },
};

// Starts a subscription checkout for a paid plan. Returns the signed
// field set the frontend redirects/POSTs the browser to; PayFast redirects
// back to PUBLIC_FRONTEND_URL/dashboard once the user completes payment,
// and separately fires the ITN webhook (notify/route.ts) which is the
// only place a plan actually gets activated.
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in to subscribe." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan as string;
  const priced = PLAN_PRICES_ZAR[plan];
  if (!priced) {
    return NextResponse.json({ error: `Unknown plan "${plan}".` }, { status: 400 });
  }

  const fields = buildCheckoutFields({
    amountZar: priced.amount,
    itemName: priced.label,
    userId: user.id,
    plan,
  });

  return NextResponse.json({
    redirectUrl: `https://${payfastHost()}/eng/process`,
    fields,
  });
}
