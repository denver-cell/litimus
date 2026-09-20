import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PricingTable from "@/components/PricingTable";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing — Litimus",
  description:
    "Litimus pricing: free at 2,000 words a day, Student $8/mo, Pro $15/mo, Team & API from $49/mo, plus a $5 day pass for extra words.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <Nav />
      <section className="pricing" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Pricing</div>
            <h2>Pay for how often you check, not for access to checking.</h2>
            <p>Every tier includes the full margin-notes report. Higher tiers add volume, file types, and integrations.</p>
          </div>
          <PricingTable />
        </div>
      </section>
      <Footer />
    </>
  );
}
