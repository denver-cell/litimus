"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

// The right-hand end of the site nav. Before this existed there was no way
// to log in (or reach the dashboard) from anywhere except by typing the URL.
// Logged out: "Log in" + the "Get started" button. Logged in: "Dashboard".
export default function NavAuth() {
  // null = not known yet. The first render matches the server's (logged-out
  // button only), so there's no hydration mismatch; links appear once the
  // session check resolves.
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = createClient();
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (active) setLoggedIn(!!data.session);
        })
        .catch(() => {
          if (active) setLoggedIn(false);
        });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setLoggedIn(!!session);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    } catch {
      // Missing Supabase env (e.g. a bare preview deploy) must never take the
      // whole site's nav down — just fall back to the logged-out buttons.
      setLoggedIn(false);
    }
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  if (loggedIn) {
    return (
      <Link href="/dashboard" className="btn">
        Dashboard
      </Link>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      {loggedIn === false && (
        <Link href="/login" style={{ fontSize: "0.92rem", color: "var(--ink-soft)", textDecoration: "none" }}>
          Log in
        </Link>
      )}
      <Link href="/pricing" className="btn">
        Get started
      </Link>
    </div>
  );
}
