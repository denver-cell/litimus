import { NextRequest, NextResponse } from "next/server";
import { analyze, verdictLabel, MAX_WORDS_PER_REQUEST, MIN_WORDS_TO_SCORE } from "@/lib/analyze";
import { getAuthedUser } from "@/lib/auth";
import { checkUsage, recordUsage, hashIp } from "@/lib/usageLimiter";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(req: NextRequest) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "`text` is required." }, { status: 400 });
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORDS_TO_SCORE) {
    return NextResponse.json(
      { error: `Passage is too short for a stable read — need at least ${MIN_WORDS_TO_SCORE} words.` },
      { status: 400 }
    );
  }
  if (wordCount > MAX_WORDS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Passage is too long for a single request — max ${MAX_WORDS_PER_REQUEST} words.` },
      { status: 413 }
    );
  }

  const user = await getAuthedUser(req);
  const ipHash = user ? null : hashIp(clientIp(req));

  const usage = await checkUsage(user?.id ?? null, ipHash, wordCount);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: usage.reason, usage: { wordsUsedToday: usage.wordsUsedToday, dailyLimit: usage.dailyLimit } },
      { status: 429 }
    );
  }

  const result = analyze(text);
  await recordUsage(user?.id ?? null, ipHash, wordCount);

  return NextResponse.json({
    result: {
      score: result.score,
      verdict: verdictLabel(result.score),
      burstiness: result.burstiness,
      ttr: result.ttr,
      phraseHits: result.phraseHits,
      hitPhrases: result.hitPhrases,
      repeats: result.repeats,
      repeatedPhrases: result.repeatedPhrases,
      wordCount: result.wordCount,
    },
    usage: {
      wordsUsedToday: usage.wordsUsedToday + wordCount,
      dailyLimit: usage.dailyLimit,
    },
  });
}
