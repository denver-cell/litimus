"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";

// Plans that can be carried through login back into checkout. Whitelisted
// (rather than passing a free-form ?next=) so this can't be used as an open
// redirect.
const CHECKOUT_PLANS = ["student", "pro", "team", "daypass"] as const;
const PLAN_NAMES: Record<(typeof CHECKOUT_PLANS)[number], string> = {
  student: "Student",
  pro: "Pro",
  team: "Team & API",
  daypass: "a day pass",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("plan");
  const plan = CHECKOUT_PLANS.find((p) => p === requested) ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      // Came here from checkout? Go straight back to it with the plan still
      // selected; otherwise the dashboard.
      router.push(plan ? `/checkout?plan=${plan}` : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Couldn't log you in — check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <h1 className="display">Log in</h1>
      <p className="hero-sub">
        {plan ? `Log in to continue with ${PLAN_NAMES[plan]}.` : "Welcome back — pick up where you left off."}
      </p>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <Link href="/forgot-password" style={{ fontSize: "0.82rem", color: "var(--steel)" }}>
              Forgot password?
            </Link>
          </div>
        </div>
        <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="auth-switch">
        New to Litimus? <Link href="/#detector">Scan a passage free</Link> — no account needed. Want more than
        2,000 words a day? <Link href={plan ? `/checkout?plan=${plan}` : "/pricing"}>{plan ? "Back to checkout" : "See plans"}</Link>.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className="auth-wrap"><p className="hero-sub">Loading…</p></div>}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
