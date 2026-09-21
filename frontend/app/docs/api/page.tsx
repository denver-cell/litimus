import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "AI Detector API for Developers — REST Docs | Litimus",
  description:
    "Litimus REST API for the Team & API plan: send text to the detect endpoint with a bearer API key and receive a scored analysis.",
  path: "/docs/api",
});

export default function ApiDocsPage() {
  return (
    <>
      <Nav />
      <section style={{ paddingTop: 72 }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="section-eyebrow">Team &amp; API</div>
          <h2>REST API (Team &amp; API plan)</h2>
          <p className="hero-sub" style={{ maxWidth: "none", marginBottom: 24 }}>
            Full reference is generated from the litmus-backend OpenAPI spec at deploy time. In the meantime, the
            core endpoint:
          </p>
          <pre className="mono" style={{ background: "var(--paper-dim)", padding: 16, borderRadius: 6, overflowX: "auto" }}>
{`POST https://api.litimus.app/api/detect
Authorization: Bearer <your API key>
Content-Type: application/json

{ "text": "passage to analyze..." }`}
          </pre>
        </div>
      </section>
      <Footer />
    </>
  );
}
