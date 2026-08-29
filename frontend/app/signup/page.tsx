"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
      <Nav />
      <div className="auth-wrap">
        <h1 className="display">Create your account</h1>
        <p className="hero-sub">Free forever for occasional checks — 2,000 words a day, no card required.</p>

        {sent ? (
          <div className="form-note">
            Check {email} for a confirmation link to finish setting up your account.
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
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>
        )}

        <div className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
