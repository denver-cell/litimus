"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseClient";
import { fetchUsage, type UsageResponse } from "@/lib/backend";
import { TIERS, type CheckoutPlanId } from "@/lib/pricing";

// After Paddle's checkout redirects back with ?payment=success, the plan
// doesn't switch on until Paddle's webhook lands — usually seconds,
// occasionally longer. Poll for it instead of showing a dashboard that still
// says "Free" right after the buyer paid.
const POLL_EVERY_MS = 3_000;
const POLL_MAX_TRIES = 20; // ~60 seconds

type Activation = "idle" | "waiting" | "active" | "delayed";

const PAID_PLAN_IDS: CheckoutPlanId[] = ["student", "pro", "team", "daypass"];

function isPaidPlan(value: string | null): value is CheckoutPlanId {
  return !!value && (PAID_PLAN_IDS as string[]).includes(value);
}

function planLabel(id: CheckoutPlanId): string {
  return id === "daypass" ? "day pass" : TIERS.find((t) => t.id === id)?.name ?? id;
}

function isActivated(plan: CheckoutPlanId, usage: UsageResponse): boolean {
  if (plan === "daypass") return (usage.dayPassWords ?? 0) > 0;
  return usage.plan === plan;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const paidPlanParam = searchParams.get("plan");

  const [email, setEmail] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activation, setActivation] = useState<Activation>("idle");
  const [paidPlan, setPaidPlan] = useState<CheckoutPlanId | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      if (!active) return;
      setEmail(session.user.email ?? null);

      let first: UsageResponse | null = null;
      try {
        first = await fetchUsage(session.access_token);
        if (active) setUsage(first);
      } catch {
        // Usage endpoint unreachable (e.g. backend not deployed yet in dev) —
        // don't block the dashboard from rendering.
        if (active) {
          setError("Couldn't load live usage from the backend — showing defaults.");
          setUsage({ wordsUsedToday: 0, dailyLimit: 2000, plan: "free" });
        }
      } finally {
        if (active) setLoading(false);
      }

      // Back from Paddle: wait for the plan to actually switch on.
      if (paymentParam === "success" && isPaidPlan(paidPlanParam) && active) {
        setPaidPlan(paidPlanParam);
        if (first && isActivated(paidPlanParam, first)) {
          setActivation("active");
          router.replace("/dashboard");
          return;
        }
        setActivation("waiting");

        let tries = 0;
        const poll = async () => {
          if (!active) return;
          tries += 1;
          try {
            const { data: refreshed } = await supabase.auth.getSession();
            const token = refreshed.session?.access_token ?? session.access_token;
            const latest = await fetchUsage(token);
            if (!active) return;
            setUsage(latest);
            if (isActivated(paidPlanParam, latest)) {
              setActivation("active");
              // Drop ?payment=success so a refresh doesn't restart the wait.
              router.replace("/dashboard");
              return;
            }
          } catch {
            // Transient failure — keep trying until we run out of tries.
          }
          if (tries >= POLL_MAX_TRIES) {
            if (active) setActivation("delayed");
            return;
          }
          timer = setTimeout(poll, POLL_EVERY_MS);
        };
        timer = setTimeout(poll, POLL_EVERY_MS);
      }
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
    // Runs once per page load; the URL params are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="dash-wrap wrap">
        <p className="hero-sub">Loading your dashboard…</p>
      </div>
    );
  }

  const pct = usage ? Math.min(100, Math.round((usage.wordsUsedToday / usage.dailyLimit) * 100)) : 0;
  const currentPlan = usage?.plan ?? "free";
  const otherPlans = TIERS.filter((t) => t.id !== "free" && t.id !== currentPlan);

  return (
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

      {paymentParam === "cancelled" && (
        <div className="form-note">Payment cancelled — you haven&apos;t been charged.</div>
      )}
      {activation === "waiting" && paidPlan && (
        <div className="form-note">
          Payment received — switching on your {planLabel(paidPlan)}… this usually takes a few seconds.
        </div>
      )}
      {activation === "active" && paidPlan && (
        <div
          style={{
            background: "var(--human-bg)",
            color: "var(--human)",
            borderRadius: "var(--radius)",
            padding: "10px 12px",
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          You&apos;re all set — your {planLabel(paidPlan)} is active. Thanks for subscribing!
        </div>
      )}
      {activation === "delayed" && paidPlan && (
        <div className="form-note">
          Paddle hasn&apos;t confirmed your payment to us yet. Your {planLabel(paidPlan)} will switch on
          automatically once it does — try refreshing in a minute or two. If it still isn&apos;t active after 15
          minutes, email <a href="mailto:support@litimus.app">support@litimus.app</a> with your Paddle receipt
          and we&apos;ll sort it out.
        </div>
      )}

      {error && <div className="form-note">{error}</div>}

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-label">Plan</div>
          <div className="dash-stat-val" style={{ textTransform: "capitalize" }}>
            {currentPlan}
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
            <Link href="/checkout?plan=daypass" style={{ color: "var(--steel)" }}>
              Buy a day pass →
            </Link>
          </div>
        </div>
      </div>

      {otherPlans.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div className="dash-stat-label" style={{ marginBottom: 12 }}>
            {currentPlan === "free" ? "Upgrade your plan" : "Change plan"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {otherPlans.map((t) => (
              <Link key={t.id} href={`/checkout?plan=${t.id}`} className="btn btn-ghost btn-sm">
                {t.name} · {t.id === "team" ? "from " : ""}
                {t.price}
                {t.priceSuffix}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="hero-sub">
        Head back to the <a href="/#detector" style={{ color: "var(--steel)" }}>detector</a> to scan a passage —
        authenticated scans count against your plan&apos;s daily word limit above instead of the anonymous free
        limit.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <Suspense
        fallback={
          <div className="dash-wrap wrap">
            <p className="hero-sub">Loading your dashboard…</p>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
      <Footer />
    </>
  );
}
