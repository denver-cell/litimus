import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { buildCheckoutFields, payfastHost } from "@/lib/payfast";

export const runtime = "nodejs";

// Kicks off a PayFast checkout for the $3 once-off day pass. The actual
// grant of +10,000 words happens in billing/payfast/notify once PayFast
// confirms the payment — never on this request, since the browser could
// call this endpoint without ever paying.
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in to buy a day pass." }, { status: 401 });
  }

  const fields = buildCheckoutFields({
    amountZar: "55.00", // ~$3 USD equivalent; replace with live FX-adjusted ZAR pricing before launch
    itemName: "Litimus day pass (+10,000 words / 24h)",
    userId: user.id,
    plan: "daypass",
  });

  return NextResponse.json({
    redirectUrl: `https://${payfastHost()}/eng/process`,
    fields,
  });
}
