import type { Metadata } from "next";

// Checkout has no search value. noindex keeps it out of results; follow stays
// true so link equity still flows through it.
export const metadata: Metadata = {
  title: "Checkout — Litimus",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
