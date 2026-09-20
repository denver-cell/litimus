import { createHmac, timingSafeEqual } from "crypto";
import type { PlanId } from "./pricing";

// Paddle Billing integration helpers: webhook signature verification and
// the plan <-> price id mapping. Unlike PayFast, checkout never touches
// this backend at all — Paddle.js opens the checkout directly from the
// browser (frontend/lib/paddle.ts) with a price id, and the ONLY thing this
// backend ever hears is the webhook (app/api/billing/paddle/webhook).
// Reference: https://developers.paddle.com/webhooks/overview

export type PurchasableId = Exclude<PlanId, "free"> | "daypass";

const PRICE_ENV_VAR: Record<PurchasableId, string> = {
  student: "PADDLE_PRICE_STUDENT",
  pro: "PADDLE_PRICE_PRO",
  team: "PADDLE_PRICE_TEAM",
  daypass: "PADDLE_PRICE_DAYPASS",
};

// Reverse lookup used by the webhook: a subscription/transaction only tells
// us which Paddle price id was purchased, so this maps it back to a plan.
// Built lazily (not at module load) so a missing env var during local dev
// doesn't crash a route that doesn't even need it.
export function planForPriceId(priceId: string): PurchasableId | null {
  for (const [plan, envVar] of Object.entries(PRICE_ENV_VAR) as [PurchasableId, string][]) {
    if (process.env[envVar] === priceId) return plan;
  }
  return null;
}

// Paddle signs webhooks as `Paddle-Signature: ts=<unix seconds>;h1=<hex hmac>`,
// the hmac being HMAC-SHA256 of `${ts}:${rawBody}` using the notification
// destination's signing secret. Must be verified against the *raw* request
// body — re-serializing parsed JSON can change byte-for-byte formatting and
// break the signature.
// https://developers.paddle.com/webhooks/signature-verification
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(";")) {
    const [key, value] = part.split("=");
    if (key && value) parts[key] = value;
  }
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const expected = createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(h1, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
