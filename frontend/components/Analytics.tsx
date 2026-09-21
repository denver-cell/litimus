"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// GA only loads when this is set (see .env.example) — unset in local dev
// and preview deploys, so that traffic never mixes into production data.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const CONSENT_KEY = "litimus_analytics_consent";

type Consent = "granted" | "denied" | "unset";

function readStoredConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  } catch {
    // Private browsing / blocked storage — treat as no decision yet rather
    // than crashing; the banner will just reappear each visit.
    return "unset";
  }
}

// Loads GA only after the visitor opts in, and shows the opt-in banner
// until they decide. trackEvent() (lib/analytics.ts) already no-ops when
// gtag hasn't loaded, so declining just means those calls stay inert.
export default function Analytics() {
  const [consent, setConsent] = useState<Consent>("unset");

  useEffect(() => {
    setConsent(readStoredConsent());
  }, []);

  function choose(value: "granted" | "denied") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Ignore — the banner will just ask again next visit.
    }
    setConsent(value);
  }

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
      {consent === "unset" && (
        <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
          <p>
            We use analytics cookies to understand site traffic. No scan text is ever sent — see our{" "}
            <a href="/privacy">privacy policy</a>.
          </p>
          <div className="cookie-banner-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => choose("denied")}>
              Decline
            </button>
            <button className="btn btn-sm" onClick={() => choose("granted")}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
