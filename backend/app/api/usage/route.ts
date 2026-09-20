import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getUsageSnapshot } from "@/lib/usageLimiter";
import { limitsFor } from "@/lib/pricing";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Log in to see your usage." }, { status: 401 });
  }

  const snapshot = await getUsageSnapshot(user.id);
  return NextResponse.json({
    plan: snapshot.plan,
    wordsUsedToday: snapshot.wordsUsedToday,
    dailyLimit: snapshot.dailyLimit,
    // Words currently coming from active day passes, so the dashboard can
    // tell when a just-bought pass has been granted.
    dayPassWords: Math.max(0, snapshot.dailyLimit - limitsFor(snapshot.plan).dailyWordLimit),
  });
}
