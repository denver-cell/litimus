import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getUsageSnapshot } from "@/lib/usageLimiter";

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
  });
}
