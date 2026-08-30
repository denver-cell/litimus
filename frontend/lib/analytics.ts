// Thin wrapper around gtag's event call. Every call is a no-op if gtag
// hasn't loaded yet (e.g. an ad blocker, or the script hasn't finished
// initializing) — event tracking should never be able to break the app.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
