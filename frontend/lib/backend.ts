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
