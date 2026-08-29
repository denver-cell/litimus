// Thin client for calling the litmus-backend API from the frontend.
// The backend enforces auth + usage limits server-side; this just wraps
// fetch with the right base URL and JSON handling.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface DetectResponse {
  result: {
    score: number;
    verdict: string;
    burstiness: number;
    ttr: number;
    phraseHits: number;
    hitPhrases: string[];
    repeats: number;
    wordCount: number;
  };
  usage: {
    wordsUsedToday: number;
    dailyLimit: number;
  };
}

export async function detectRemote(text: string, accessToken?: string): Promise<DetectResponse> {
  const res = await fetch(`${BACKEND_URL}/api/detect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Detection request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchUsage(accessToken: string) {
  const res = await fetch(`${BACKEND_URL}/api/usage`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Usage request failed (${res.status})`);
  return res.json();
}

export interface AnonUsageCheck {
  allowed: boolean;
  wordsUsedToday?: number;
  dailyLimit?: number;
  error?: string;
}

// Reports only `wordCount` — never the manuscript text — to
// /api/usage/check-anon, so the free hero detector (components/Detector.tsx)
// can enforce a real cross-session daily word cap (tracked server-side by
// hashed IP) while still scoring the actual passage locally in the browser.
// See backend/app/api/usage/check-anon/route.ts for the enforcement side.
export async function checkAnonUsage(wordCount: number): Promise<AnonUsageCheck> {
  const res = await fetch(`${BACKEND_URL}/api/usage/check-anon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordCount }),
  });
  const body = await res.json().catch(() => ({} as Record<string, unknown>));

  if (!res.ok) {
    return {
      allowed: false,
      wordsUsedToday: body.wordsUsedToday as number | undefined,
      dailyLimit: body.dailyLimit as number | undefined,
      error: (body.error as string | undefined) || `Usage check failed (${res.status})`,
    };
  }

  return {
    allowed: true,
    wordsUsedToday: body.wordsUsedToday as number | undefined,
    dailyLimit: body.dailyLimit as number | undefined,
  };
}

export interface AnonUsageSnapshot {
  wordsUsedToday: number;
  dailyLimit: number;
}

// Read-only peek at today's free-tier usage (GET /api/usage/check-anon),
// used to show "X of 2,000 free words left today" as soon as the hero
// detector loads — never consumes any quota itself. Returns null on any
// failure (offline, backend down, CORS hiccup) so callers can just fall
// back to the static "2,000 words / day" copy instead of erroring.
export async function peekAnonUsage(): Promise<AnonUsageSnapshot | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/usage/check-anon`, { method: "GET" });
    if (!res.ok) return null;
    const body = await res.json();
    if (typeof body.wordsUsedToday !== "number" || typeof body.dailyLimit !== "number") return null;
    return { wordsUsedToday: body.wordsUsedToday, dailyLimit: body.dailyLimit };
  } catch {
    return null;
  }
}
