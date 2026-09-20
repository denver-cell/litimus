import type { Metadata } from "next";

// Account pages have no search value. noindex keeps them out of results;
// follow stays true so link equity still flows through them.
export const metadata: Metadata = {
  title: "Dashboard — Litimus",
  robots: { index: false, follow: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
