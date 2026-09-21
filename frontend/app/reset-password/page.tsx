"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";

type Status = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });
    // The reset link's session is usually already picked up from the URL
    // before this listener attaches — check directly too, and only give up
    // on "invalid" after giving that a moment to land.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });
    const timeout = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 3000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Couldn't update your password — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="auth-wrap">
        <h1 className="display">Reset your password</h1>

        {status === "checking" && <p className="hero-sub">Checking your link…</p>}

        {status === "invalid" && (
          <p className="hero-sub">
            This link is invalid or has expired. Request a new one from the{" "}
            <Link href="/forgot-password">forgot password</Link> page.
          </p>
        )}

        {status === "ready" && (
          <>
            <p className="hero-sub">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}
              <div className="field">
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Saving…" : "Save new password"}
              </button>
            </form>
          </>
        )}

        {status === "success" && <p className="hero-sub">Password updated — taking you to your dashboard…</p>}
      </div>
      <Footer />
    </>
  );
}
