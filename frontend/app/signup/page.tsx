"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";
import { TIERS, DAY_PASS, type TierId } from "@/lib/pricing";

type SignupOption = TierId | "daypass";

interface OptionCopy {
  id: SignupOption;
  label: string;
  price: string;
  blurb: string;
}

// Every option a visitor can land here wanting — built from the same
// TIERS/DAY_PASS data the pricing page uses, so the copy never drifts.
// "free" isn't included: the Free tier's CTA skips signup entirely and
// goes straight to the anonymous detector (see PricingTable.tsx).
const OPTIONS: OptionCopy[] = [
  ...TIERS.filter((t) => t.id !== "free").map((t) => ({
    id: t.id as SignupOption,
    label: t.name,
    price: `${t.price}${t.priceSuffix ?? ""}`,
    blurb: t.description,
  })),
  {
    id: "daypass",
    label: "Day pass",
    price: `${DAY_PASS.price} once-off`,
    blurb: DAY_PASS.description,
  },
];

function isSignupOption(value: string | null): value is SignupOption {
  return !!value && OPTIONS.some((o) => o.id === value);
}

// Reads ?plan=<id> to preselect an option (set by the pricing table's CTAs),
// but the pill row below stays fully editable — landing here from the wrong
// button, or just changing your mind, shouldn't mean starting over.
function SignupForm() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const [selected, setSelected] = useState<SignupOption>(
    isSignupOption(requestedPlan) ? requestedPlan : "student"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const option = OPTIONS.find((o) => o.id === selected)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong creating your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="display">Create your account</h1>
      <p className="hero-sub">
        {option.price} — {option.blurb}
      </p>

      <div className="field">
        <label>Signing up for</label>
        <div className="plan-select-row">
          {OPTIONS.map((o) => (
            <button
              type="button"
              key={o.id}
              className={`plan-select-pill ${selected === o.id ? "active" : ""}`}
              onClick={() => setSelected(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {sent ? (
        <div className="form-note">
          Check {email} for a confirmation link. Once you&apos;re confirmed and logged in, you can add {option.label}{" "}
          from your dashboard.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account…" : `Continue with ${option.label}`}
          </button>
        </form>
      )}

      <div className="auth-switch">
        Just want to try it first? <Link href="/#detector">Scan a passage free</Link> — no account needed.
      </div>
      <div className="auth-switch">
        Already have an account? <Link href="/login">Log in</Link>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <>
      <Nav />
      <div className="auth-wrap">
        <Suspense fallback={<p className="hero-sub">Loading…</p>}>
          <SignupForm />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
