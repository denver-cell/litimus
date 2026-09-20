import { initializePaddle, type Paddle, type PaddleEventData } from "@paddle/paddle-js";
import type { CheckoutPlanId } from "./pricing";

// Paddle checkout — opened directly from the browser via Paddle.js, unlike
// PayFast's server-built signed-field redirect. This backend never starts a
// payment; it only ever hears about one after the fact, through the webhook
// (backend/app/api/billing/paddle/webhook).

const PRICE_IDS: Record<CheckoutPlanId, string | undefined> = {
  student: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDENT,
  pro: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO,
  team: process.env.NEXT_PUBLIC_PADDLE_PRICE_TEAM,
  daypass: process.env.NEXT_PUBLIC_PADDLE_PRICE_DAYPASS,
};

let paddlePromise: Promise<Paddle | undefined> | undefined;
// Paddle.js only supports one global event callback (set at Initialize
// time), so route "the overlay was closed without paying" to whichever
// checkout is currently open.
let onCheckoutClosed: (() => void) | undefined;

function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
      console.error("Paddle is not configured — set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.");
      return Promise.resolve(undefined);
    }
    paddlePromise = initializePaddle({
      token,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      eventCallback: (event: PaddleEventData) => {
        if (event.name === "checkout.closed") onCheckoutClosed?.();
      },
    });
  }
  return paddlePromise;
}

export interface OpenCheckoutParams {
  plan: CheckoutPlanId;
  userId: string;
  email: string;
  // Fired if the buyer closes the overlay without completing payment, so
  // the caller can drop back out of a "working" state. On a successful
  // payment Paddle navigates the browser to successUrl itself — no
  // callback needed for that case.
  onClose: () => void;
}

export async function openPaddleCheckout({ plan, userId, email, onClose }: OpenCheckoutParams): Promise<void> {
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`Payments for "${plan}" aren't configured yet. Please email support@litimus.app.`);
  }

  const paddle = await getPaddle();
  if (!paddle) {
    throw new Error("Payments are temporarily unavailable. Please try again shortly or email support@litimus.app.");
  }

  onCheckoutClosed = onClose;
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email },
    customData: { user_id: userId, plan },
    settings: {
      successUrl: `${window.location.origin}/dashboard?payment=success&plan=${plan}`,
    },
  });
}
