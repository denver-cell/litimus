import Link from "next/link";
import { TIERS, DAY_PASS } from "@/lib/pricing";

export default function PricingTable() {
  return (
    <>
      <div className="plan-grid">
        {TIERS.map((tier) => (
          <div key={tier.id} className={`plan ${tier.featured ? "featured" : ""}`}>
            {tier.badge && (
              <div className={`plan-badge ${tier.id === "student" ? "student" : ""}`}>{tier.badge}</div>
            )}
            <div className="plan-name">{tier.name}</div>
            <div className="plan-price">
              {tier.price}
              {tier.priceSuffix && <sup>{tier.priceSuffix}</sup>}
            </div>
            <div className="plan-cycle">{tier.cycle}</div>
            <div className="plan-desc">{tier.description}</div>
            <ul className="plan-feats">
              {tier.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className={`btn ${tier.featured ? "" : "btn-ghost"}`}>
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="student-note">
        <span>🎓</span>
        <div>
          <b>Student pricing is a real discount, not a trial.</b> Verify once a year through our global
          student-verification partner and keep Pro-level limits at $4/mo — about the cost of one coffee, because
          we&apos;d rather have students checking their own drafts than avoiding the tool entirely.
        </div>
      </div>

      <div className="boost-card">
        <div className="boost-info">
          <span className="boost-icon">+</span>
          <div>
            <h3>Just need more words today?</h3>
            <p>{DAY_PASS.description}</p>
          </div>
        </div>
        <div className="boost-price">
          <div className="amount mono">
            {DAY_PASS.price}
            <sup>{DAY_PASS.priceSuffix}</sup>
          </div>
          <Link href="/signup" className="btn btn-ghost">
            Buy a day pass
          </Link>
        </div>
      </div>
    </>
  );
}
