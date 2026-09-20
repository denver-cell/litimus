import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy — Litimus",
  description:
    "How Litimus handles your text: free and Student scans run in your browser, and saved report history on paid plans is opt-in and off by default.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <section style={{ paddingTop: 72 }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="section-eyebrow">Privacy</div>
          <h2>How Litimus handles your text.</h2>
          <p className="hero-sub" style={{ maxWidth: "none" }}>
            Free and Student scans run entirely in your browser and are never sent to our servers. Authenticated
            scans on Pro and Team plans pass through our detection API to enforce usage limits and, only if you
            opt in, to save report history to your account — off by default. We never sell or share scanned text
            with third parties. Full legal privacy policy to be finalized before launch.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
