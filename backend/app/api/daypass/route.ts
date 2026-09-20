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

  let fields;
  try {
    fields = buildCheckoutFields({
      amountZar: "55.00", // ~$3 USD equivalent; replace with live FX-adjusted ZAR pricing before launch
      itemName: "Litimus day pass (+10,000 words / 24h)",
      userId: user.id,
      plan: "daypass",
    });
  } catch (err) {
    // Most likely PayFast credentials aren't set on this site yet.
    console.error("PayFast day pass checkout could not be built:", err);
    return NextResponse.json(
      { error: "Payments are temporarily unavailable. Please try again shortly or email support@litimus.app." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    redirectUrl: `https://${payfastHost()}/eng/process`,
    fields,
  });
}
