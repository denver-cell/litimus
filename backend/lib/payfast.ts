import { createHash } from "crypto";

// PayFast signature + ITN (Instant Transaction Notification) helpers.
// Reference: https://developers.payfast.co.za/docs#step_2_signature
//
// PayFast's signature is an MD5 hash of every non-blank field, in the
// exact order they're sent, joined as `key=urlencoded_value&...`, with
// the merchant passphrase appended (if one is set) before hashing.

function isSandbox(): boolean {
  return (process.env.PAYFAST_SANDBOX || "true").toLowerCase() !== "false";
}

export function payfastHost(): string {
  return isSandbox() ? "sandbox.payfast.co.za" : "www.payfast.co.za";
}

// PayFast expects PHP's urlencode-style escaping: spaces as "+", not %20.
function pfEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function generateSignature(fields: Record<string, string | number | undefined>, passphrase?: string): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "" || key === "signature") continue;
    parts.push(`${key}=${pfEncode(String(value).trim())}`);
  }
  let paramString = parts.join("&");
  if (passphrase) {
    paramString += `&passphrase=${pfEncode(passphrase.trim())}`;
  }
  return createHash("md5").update(paramString).digest("hex");
}

export interface CheckoutParams {
  amountZar: string; // e.g. "15.00" — PayFast requires 2 decimal places
  itemName: string;
  userId: string; // passed through as m_payment_id / custom_str1 to identify the user on the webhook
  plan: string; // custom_str2 — which plan/day-pass this purchase is for
}

/**
 * Builds the signed field set for a PayFast "Onsite" or hosted redirect
 * checkout. The caller POSTs (or redirects with) these fields to
 * https://{payfastHost()}/eng/process.
 */
export function buildCheckoutFields(params: CheckoutParams) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const frontendUrl = process.env.PUBLIC_FRONTEND_URL || "https://litimus.app";
  const backendUrl = process.env.BACKEND_PUBLIC_URL || "https://api.litimus.app";

  if (!merchantId || !merchantKey) {
    throw new Error("PayFast is not configured — set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY.");
  }

  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${frontendUrl}/dashboard?payment=success`,
    cancel_url: `${frontendUrl}/pricing?payment=cancelled`,
    notify_url: `${backendUrl}/api/billing/payfast/notify`,
    m_payment_id: `${params.userId}:${Date.now()}`,
    amount: params.amountZar,
    item_name: params.itemName,
    custom_str1: params.userId,
    custom_str2: params.plan,
  };

  const signature = generateSignature(fields, passphrase);
  return { ...fields, signature };
}

/**
 * Recomputes the signature over the fields PayFast sent in the ITN
 * postback and compares it to the one they included, to reject forged
 * notifications. The caller is still responsible for the second layer of
 * PayFast's recommended validation — posting the raw body back to
 * PayFast's `validate` endpoint (see notify/route.ts) — before trusting
 * the payment.
 */
export function verifySignature(fields: Record<string, string>): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const { signature, ...rest } = fields;
  if (!signature) return false;
  return generateSignature(rest, passphrase) === signature;
}
