"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
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
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Couldn't log you in — check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="auth-wrap">
        <h1 className="display">Log in</h1>
        <p className="hero-sub">Welcome back — pick up where you left off.</p>

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
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="auth-switch">
          New to Litimus? <Link href="/signup">Create a free account</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
