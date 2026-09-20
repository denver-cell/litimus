import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Stub integration point for a third-party student-verification service
// (the kind Spotify/Amazon use — e.g. SheerID or UNiDAYS), as promised on
// the pricing page. Swap the TODO below for a real call to that
// provider's API once an account is set up; this route's job is just to
// mark the user's profile as student-verified once that check passes.
// NOTE: nothing currently reads student_verified_until to gate the student
// plan at checkout — anyone can buy it today. Wiring that check in (likely
// in frontend/app/checkout/page.tsx, before openPaddleCheckout) is a
// prerequisite for a real verification provider being worth adding here.
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const verificationToken = body.verificationToken as string | undefined;
  if (!verificationToken) {
    return NextResponse.json({ error: "Missing verificationToken from the verification widget." }, { status: 400 });
  }

  // TODO: call the real student-verification provider here with
  // verificationToken and confirm it belongs to this user before trusting it.
  const verified = true;

  if (!verified) {
    return NextResponse.json({ error: "Could not verify student status." }, { status: 422 });
  }

  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await supabaseAdmin()
    .from("profiles")
    .upsert({ id: user.id, student_verified_until: oneYearFromNow }, { onConflict: "id" });

  return NextResponse.json({ ok: true, verifiedUntil: oneYearFromNow });
}
