import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PricingTable from "@/components/PricingTable";

export const metadata = {
  title: "Pricing — Litimus",
};

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
