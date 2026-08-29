import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { checkUsage, recordUsage, hashIp } from "@/lib/usageLimiter";
import { MIN_WORDS_TO_SCORE, MAX_WORDS_PER_REQUEST } from "@/lib/analyze";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

// Reports only a WORD COUNT — never the manuscript text — so the free
// client-side scanner (frontend/components/Detector.tsx) can enforce a
// real cross-tab, cross-session daily cap without breaking the "processed
// in your browser, never sent anywhere" promise on the landing page.
//
// Uses the exact same hashed-IP usage bucket /api/detect already uses for
// anonymous callers (see usageLimiter.ts), so a visitor's free-tier usage
// is one shared 2,000-word/day total regardless of how many tabs, page
// reloads, or browser sessions they use — it resets daily (UTC) and is
// keyed off their hashed IP address, not any client-side storage the
// visitor could just clear.
//
// If allowed, usage is recorded immediately and the frontend goes on to
// score the text locally. If not allowed, nothing is recorded and the
// caller should show the paywall instead of scanning.
export async function POST(req: NextRequest) {
  let body: { wordCount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const wordCount = Number(body.wordCount);
  if (!Number.isFinite(wordCount) || wordCount <= 0) {
    return NextResponse.json({ error: "`wordCount` must be a positive number." }, { status: 400 });
  }
  if (wordCount < MIN_WORDS_TO_SCORE || wordCount > MAX_WORDS_PER_REQUEST) {
    return NextResponse.json({ error: "wordCount out of range." }, { status: 400 });
  }

  const user = await getAuthedUser(req);
  const ipHash = user ? null : hashIp(clientIp(req));

  const usage = await checkUsage(user?.id ?? null, ipHash, wordCount);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        allowed: false,
        error: usage.reason,
        wordsUsedToday: usage.wordsUsedToday,
        dailyLimit: usage.dailyLimit,
      },
      { status: 429 }
    );
  }

  await recordUsage(user?.id ?? null, ipHash, wordCount);

  return NextResponse.json({
    allowed: true,
    wordsUsedToday: usage.wordsUsedToday + wordCount,
    dailyLimit: usage.dailyLimit,
  });
}

// Read-only peek at today's usage so the frontend can show "X of 2,000
// free words left today" as soon as the detector loads, before the
// visitor has typed or scanned anything. Calls checkUsage() with a
// wordCount of 0, which never trips the "would exceed the limit" check
// and — importantly — is never passed to recordUsage(), so calling this
// as often as the page likes never consumes any of the visitor's quota.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const ipHash = user ? null : hashIp(clientIp(req));

  const usage = await checkUsage(user?.id ?? null, ipHash, 0);
  return NextResponse.json({
    wordsUsedToday: usage.wordsUsedToday,
    dailyLimit: usage.dailyLimit,
  });
}
