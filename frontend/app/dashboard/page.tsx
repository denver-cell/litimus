"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";
import { fetchUsage } from "@/lib/backend";

interface UsageState {
  wordsUsedToday: number;
  dailyLimit: number;
  plan: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      setEmail(session.user.email ?? null);

      try {
        const u = await fetchUsage(session.access_token);
        setUsage(u);
      } catch {
        // Usage endpoint unreachable (e.g. backend not deployed yet in dev) —
        // don't block the dashboard from rendering.
        setError("Couldn't load live usage from the backend — showing defaults.");
        setUsage({ wordsUsedToday: 0, dailyLimit: 2000, plan: "free" });
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="dash-wrap wrap">
          <p className="hero-sub">Loading your dashboard…</p>
        </div>
        <Footer />
      </>
    );
  }

  const pct = usage ? Math.min(100, Math.round((usage.wordsUsedToday / usage.dailyLimit) * 100)) : 0;

  return (
    <>
      <Nav />
      <div className="dash-wrap wrap">
        <div className="dash-head">
          <div>
            <h1 className="display" style={{ fontSize: "2rem", marginBottom: 4 }}>
              Welcome back{email ? `, ${email}` : ""}
            </h1>
            <p className="hero-sub" style={{ margin: 0 }}>
              Here&apos;s where your daily usage and plan stand.
            </p>
          </div>
          <button className="btn btn-ghost" onClick={handleSignOut}>
            Sign out
          </button>
        </div>

        {error && <div className="form-note">{error}</div>}

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-label">Plan</div>
            <div className="dash-stat-val" style={{ textTransform: "capitalize" }}>
              {usage?.plan ?? "free"}
            </div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Words used today</div>
            <div className="dash-stat-val">
              {usage?.wordsUsedToday ?? 0} / {usage?.dailyLimit ?? 2000}
            </div>
            <div className="usage-bar-track">
              <div className="usage-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Need more today?</div>
            <div className="dash-stat-val" style={{ fontSize: "1.1rem" }}>
              <a href="/pricing" style={{ color: "var(--steel)" }}>
                Buy a day pass →
              </a>
            </div>
          </div>
        </div>

        <p className="hero-sub">
          Head back to the <a href="/#detector" style={{ color: "var(--steel)" }}>detector</a> to scan a passage —
          authenticated scans count against your plan&apos;s daily word limit above instead of the anonymous free
          limit.
        </p>
      </div>
      <Footer />
    </>
  );
}
