// Thin client for calling the litmus-backend API from the frontend.
// The backend enforces auth + usage limits server-side; this just wraps
// fetch with the right base URL and JSON handling.

import type { CheckoutPlanId } from "./pricing";

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

export interface UsageResponse {
  plan: string;
  wordsUsedToday: number;
  dailyLimit: number;
  // Words currently granted by active day passes (0 when none). Added with
  // the checkout flow so the dashboard can tell when a day pass has landed.
  dayPassWords?: number;
}

export async function fetchUsage(accessToken: string): Promise<UsageResponse> {
  const res = await fetch(`${BACKEND_URL}/api/usage`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Usage request failed (${res.status})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Checkout (PayFast)
// ---------------------------------------------------------------------------

// Thrown when the backend says the caller isn't (or is no longer) logged in,
// so the checkout page can send them to /login instead of showing a raw error.
export class AuthRequiredError extends Error {}

export interface PayfastCheckout {
  redirectUrl: string;
  fields: Record<string, string>;
}

// Asks the backend for a signed PayFast field set. Subscriptions and the
// day pass are separate endpoints; neither grants anything itself — the plan
// only switches on when PayFast's ITN webhook confirms payment.
export async function createCheckout(plan: CheckoutPlanId, accessToken: string): Promise<PayfastCheckout> {
  const path = plan === "daypass" ? "/api/daypass" : "/api/billing/payfast/checkout";
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ plan }),
  });
  const body = await res.json().catch(() => ({} as Record<string, unknown>));

  if (res.status === 401) {
    throw new AuthRequiredError((body.error as string | undefined) || "Please log in to continue.");
  }
  if (!res.ok) {
    throw new Error((body.error as string | undefined) || `Couldn't start checkout (${res.status}). Please try again.`);
  }
  return body as unknown as PayfastCheckout;
}

const PAYFAST_HOSTS = new Set(["www.payfast.co.za", "sandbox.payfast.co.za"]);

// PayFast's hosted checkout takes a form POST, so build a hidden form from
// the signed fields and submit it. Field order is preserved (the signature
// depends on it). Refuses to post to anything that isn't PayFast.
export function redirectToPayfast({ redirectUrl, fields }: PayfastCheckout): void {
  const target = new URL(redirectUrl);
  if (target.protocol !== "https:" || !PAYFAST_HOSTS.has(target.hostname)) {
    throw new Error("Unexpected payment address — checkout was stopped for your safety.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = redirectUrl;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
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
