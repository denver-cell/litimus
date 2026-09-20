"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";
import { TIERS, DAY_PASS, TERMS_VERSION, type CheckoutPlanId } from "@/lib/pricing";
import { fetchUsage, AuthRequiredError } from "@/lib/backend";
import { openPaddleCheckout } from "@/lib/paddle";
import { trackEvent } from "@/lib/analytics";
import styles from "./checkout.module.css";

// The whole purchase happens on this one page, in the order people expect:
//   1. choose a plan (price + billing period shown up front)
//   2. enter your details
//   3. review the order and agree to the Terms
// Submitting creates the account, then opens Paddle's checkout overlay to pay.
// (Nobody is asked to log in or sign up before they've picked something.)

interface CheckoutOption {
  id: CheckoutPlanId;
  name: string;
  price: string; // headline price, e.g. "$15" or "from $49"
  period: string; // what that price covers, e.g. "per month"
  blurb: string;
  features: string[];
  badge?: string;
}

// Built from the same TIERS/DAY_PASS data the pricing page uses so the copy
// can't drift. "free" is excluded — it needs no account and no payment.
const OPTIONS: CheckoutOption[] = [
  ...TIERS.filter((t) => t.id !== "free").map((t) => ({
    id: t.id as CheckoutPlanId,
    name: t.name,
    price: t.id === "team" ? `from ${t.price}` : t.price,
    period: "per month",
    blurb: t.description,
    features: t.features,
    badge: t.badge,
  })),
  {
    id: "daypass" as CheckoutPlanId,
    name: "Day pass",
    price: DAY_PASS.price,
    period: "for 24 hours · once-off",
    blurb: "A one-off top-up for a single deadline. No subscription.",
    features: [
      `+${DAY_PASS.words.toLocaleString("en-US")} words on top of your daily limit`,
      `Valid for ${DAY_PASS.validHours} hours from purchase`,
      "Stacks on any plan, including Free",
    ],
  },
];

function isCheckoutPlan(value: string | null): value is CheckoutPlanId {
  return !!value && OPTIONS.some((o) => o.id === value);
}

type AuthState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "authed"; email: string; termsAcceptedAt: string | null };

type Phase = "form" | "working" | "confirm-email";
type LoginHint = null | "exists" | "expired";

function CheckoutFlow() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const cancelled = searchParams.get("payment") === "cancelled";

  const [plan, setPlan] = useState<CheckoutPlanId>(isCheckoutPlan(requestedPlan) ? requestedPlan : "pro");
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [loginHint, setLoginHint] = useState<LoginHint>(null);

  // Who is this? Someone arriving already logged in (or back from confirming
  // their email) skips the details step entirely.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const session = data.session;
        if (!session) {
          setAuth({ status: "anon" });
          return;
        }
        const meta = session.user.user_metadata as Record<string, unknown> | undefined;
        setAuth({
          status: "authed",
          email: session.user.email ?? "",
          termsAcceptedAt: typeof meta?.terms_accepted_at === "string" ? meta.terms_accepted_at : null,
        });
        try {
          const usage = await fetchUsage(session.access_token);
          if (active) setCurrentPlan(usage.plan);
        } catch {
          // Backend unreachable — the plan check is a nicety, not a blocker.
        }
      } catch {
        if (active) setAuth({ status: "anon" });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Browser Back can restore this page frozen mid-"working" (e.g. after
  // closing Paddle's overlay); put the button back so the buyer isn't stuck
  // on a dead spinner.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPhase((p) => (p === "working" ? "form" : p));
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const option = OPTIONS.find((o) => o.id === plan)!;
  // The total is shown in US dollars, matching the pricing page — Paddle
  // bills in real USD, no FX conversion or disclosure needed.
  const usdTotal = `$${Number(option.price.replace(/[^0-9.]/g, "")).toFixed(2)}`;
  const isAuthed = auth.status === "authed";
  const alreadyAgreed = auth.status === "authed" && auth.termsAcceptedAt !== null;
  const alreadyOnPlan = plan !== "daypass" && currentPlan === plan;
  const busy = phase === "working";
  const loginHref = `/login?plan=${plan}`;

  async function handleSignOut() {
    try {
      await createClient().auth.signOut();
    } catch {
      // Nothing useful to do — fall through and show the details form.
    }
    setAuth({ status: "anon" });
    setCurrentPlan(null);
    setAgreed(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setLoginHint(null);

    if (!alreadyAgreed && !agreed) {
      setError("Please tick the box to agree to the Terms of Service and Refund Policy.");
      return;
    }

    setPhase("working");
    try {
      const supabase = createClient();
      const acceptedAt = new Date().toISOString();
      let userId: string;
      let buyerEmail: string;

      if (auth.status === "authed") {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new AuthRequiredError("Your session expired.");
        userId = data.session.user.id;
        buyerEmail = auth.email;
        if (!alreadyAgreed) {
          // Record the agreement on the account. Best effort: never let a
          // metadata hiccup block someone who is trying to pay.
          try {
            await supabase.auth.updateUser({
              data: { terms_accepted_at: acceptedAt, terms_version: TERMS_VERSION },
            });
          } catch {
            /* ignore */
          }
        }
      } else {
        // The account is created here, off the back of the completed form.
        // If email confirmation is on, the confirmation link brings them
        // straight back to this page with the plan still selected.
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/checkout?plan=${plan}`,
            data: { terms_accepted_at: acceptedAt, terms_version: TERMS_VERSION, signup_plan: plan },
          },
        });

        if (signUpError) {
          if (/already registered/i.test(signUpError.message)) {
            setLoginHint("exists");
            setPhase("form");
            return;
          }
          throw signUpError;
        }
        // With email confirmation on, Supabase answers an already-registered
        // address with a fake user that has no identities (no error).
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setLoginHint("exists");
          setPhase("form");
          return;
        }

        trackEvent("sign_up", { method: "email", plan });

        if (!data.session) {
          setPhase("confirm-email");
          return;
        }
        userId = data.session.user.id;
        buyerEmail = email;
        setAuth({ status: "authed", email, termsAcceptedAt: acceptedAt });
      }

      trackEvent("begin_checkout", { plan, currency: "USD" });
      await openPaddleCheckout({
        plan,
        userId,
        email: buyerEmail,
        onClose: () => setPhase("form"),
      });
      // Stay in "working" behind Paddle's overlay: on success it navigates
      // the browser to successUrl itself; onClose above handles cancelling.
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setLoginHint("expired");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
      setPhase("form");
    }
  }

  // ---- "Check your email" state (only when email confirmation is on) ----
  if (phase === "confirm-email") {
    return (
      <div className={styles.page}>
        <div className={styles.confirmCard}>
          <div className={styles.eyebrow}>Almost there</div>
          <h2>Confirm your email to finish</h2>
          <p>
            We&apos;ve created your account and sent a confirmation link to <b>{email}</b>. Click it and you&apos;ll
            land straight back here to pay for {option.name} — your plan is already selected.
          </p>
          <p>
            Nothing has been charged yet. Can&apos;t find the email? Check your spam folder, or{" "}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                setPhase("form");
                setPassword("");
              }}
            >
              use a different address
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.eyebrow}>Checkout</div>
      <h1 className={styles.title}>Get set up in three steps</h1>
      <p className={styles.lead}>
        Choose a plan, add your details, and agree to the terms. We&apos;ll create your account and open Paddle&apos;s
        secure checkout to pay.
      </p>

      {cancelled && (
        <div className="form-note">
          Payment cancelled — you haven&apos;t been charged. Your order is still below whenever you&apos;re ready.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ---------------- 1. Plan ---------------- */}
        <section className={styles.section} aria-labelledby="step-plan">
          <div className={styles.sectionHead}>
            <span className={styles.num}>1</span>
            <h2 className={styles.sectionTitle} id="step-plan">
              Choose your plan
            </h2>
          </div>

          <fieldset className={styles.options} disabled={busy}>
            <legend className={styles.srOnly}>Plan</legend>
            {OPTIONS.map((o) => (
              <label key={o.id} className={`${styles.option} ${plan === o.id ? styles.optionSelected : ""}`}>
                <input type="radio" name="plan" value={o.id} checked={plan === o.id} onChange={() => setPlan(o.id)} />
                <span className={styles.optionMain}>
                  <span className={styles.optionName}>
                    {o.name}
                    {o.badge && o.badge !== o.name && <span className={styles.badge}>{o.badge}</span>}
                  </span>
                  <span className={styles.optionBlurb}>{o.blurb}</span>
                </span>
                <span className={styles.optionPrice}>
                  <span className={styles.priceAmount}>{o.price}</span>
                  <span className={styles.pricePeriod}>{o.period}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <ul className={styles.features}>
            {option.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        {/* ---------------- 2. Details ---------------- */}
        <section className={styles.section} aria-labelledby="step-details">
          <div className={styles.sectionHead}>
            <span className={styles.num}>2</span>
            <h2 className={styles.sectionTitle} id="step-details">
              Your details
            </h2>
          </div>

          {auth.status === "loading" && <p className={styles.signedIn}>One moment…</p>}

          {auth.status === "authed" && (
            <p className={styles.signedIn}>
              Signed in as <b>{auth.email}</b>.{" "}
              <button type="button" className={styles.linkButton} onClick={handleSignOut} disabled={busy}>
                Not you?
              </button>
            </p>
          )}

          {auth.status === "anon" && (
            <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={busy}
                />
              </div>
              <div className="field" style={{ marginBottom: 6 }}>
                <label htmlFor="password">Choose a password</label>
                <div className={styles.passwordRow}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className={styles.hint}>At least 8 characters.</div>
              </div>
              <div className="auth-switch" style={{ marginTop: 14 }}>
                Already have an account? <Link href={loginHref}>Log in</Link> and we&apos;ll bring you back here.
              </div>
            </>
          )}
        </section>

        {/* ---------------- 3. Review + terms ---------------- */}
        <section className={styles.section} aria-labelledby="step-review">
          <div className={styles.sectionHead}>
            <span className={styles.num}>3</span>
            <h2 className={styles.sectionTitle} id="step-review">
              Review &amp; agree
            </h2>
          </div>

          <dl className={styles.summary}>
            <div className={styles.summaryRow}>
              <dt>Plan</dt>
              <dd>{option.name}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Price</dt>
              <dd>
                {option.price} {option.period}
              </dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Billing</dt>
              <dd>{plan === "daypass" ? "One payment, no renewal" : "Monthly, in advance"}</dd>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <dt>You pay today</dt>
              <dd>{usdTotal}</dd>
            </div>
          </dl>
          <p className={styles.fineprint}>
            Payments are processed securely by Paddle, our merchant of record, in US dollars — no currency
            conversion or surprise FX fee.
          </p>

          {alreadyAgreed ? (
            <p className={styles.agreed}>
              You agreed to our{" "}
              <Link href="/terms" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" target="_blank">
                Refund Policy
              </Link>{" "}
              when you created your account.
            </p>
          ) : (
            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={busy}
              />
              <span>
                I have read and agree to the{" "}
                <Link href="/terms" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/refund-policy" target="_blank">
                  Refund Policy
                </Link>
                .
              </span>
            </label>
          )}

          {loginHint === "exists" && (
            <div className="form-error">
              An account with this email already exists. <Link href={loginHref}>Log in</Link> to continue with this
              order.
            </div>
          )}
          {loginHint === "expired" && (
            <div className="form-error">
              Your session has expired. <Link href={loginHref}>Log in again</Link> to continue with this order.
            </div>
          )}
          {error && <div className="form-error">{error}</div>}

          {alreadyOnPlan ? (
            <div className="form-note">
              You&apos;re already on the {option.name} plan.{" "}
              <Link href="/dashboard" style={{ textDecoration: "underline" }}>
                Go to your dashboard
              </Link>{" "}
              or pick a different plan above.
            </div>
          ) : (
            <button
              className={`btn ${styles.pay}`}
              type="submit"
              disabled={busy || auth.status === "loading"}
            >
              {busy
                ? isAuthed
                  ? "Opening secure checkout…"
                  : "Creating your account…"
                : isAuthed
                  ? `Pay ${usdTotal} with Paddle`
                  : "Create account & continue to payment"}
            </button>
          )}
          <p className={styles.secure}>
            You&apos;ll pay through Paddle&apos;s secure checkout — we never see or store your card details.
          </p>
        </section>
      </form>

      <div className="auth-switch" style={{ textAlign: "center" }}>
        Just want to try it first? <Link href="/#detector">Scan a passage free</Link> — no account needed.
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className={styles.page}><p className="hero-sub">Loading checkout…</p></div>}>
        <CheckoutFlow />
      </Suspense>
      <Footer />
    </>
  );
}
