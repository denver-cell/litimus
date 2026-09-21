"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="auth-wrap">
        <h1 className="display">Reset your password</h1>

        {sent ? (
          <p className="hero-sub">
            If there&apos;s an account for <b>{email}</b>, a password reset link is on its way. Check your inbox
            (and spam folder) — the link expires after a while, so use it soon.
          </p>
        ) : (
          <>
            <p className="hero-sub">Enter your email and we&apos;ll send you a link to set a new password.</p>
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
              <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <div className="auth-switch">
          <Link href="/login">Back to log in</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
