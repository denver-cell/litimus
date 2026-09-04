import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Refund Policy — Litimus" };

export default function RefundPolicyPage() {
  return (
    <>
      <Nav />
      <section style={{ paddingTop: 72, paddingBottom: 64 }}>
        <div className="wrap legal" style={{ maxWidth: 720 }}>
          <div className="section-eyebrow">Refund Policy</div>
          <h2>Refund Policy</h2>
          <p className="hero-sub" style={{ maxWidth: "none" }}>
            Last updated: September 4, 2026
          </p>

          <p>
            This Refund Policy applies to all purchases made through litimus.app (&quot;Litimus&quot;, &quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;), including subscription plans and once-off Day Passes. By purchasing a
            subscription or Day Pass, you agree to the terms below.
          </p>

          <h3>1. Free Tier</h3>
          <p>
            Litimus offers a free tier (2,000 words of AI-detection scanning per day, no account required) so that
            prospective customers can evaluate the accuracy and usefulness of the service before paying for
            anything. Because a free evaluation option is always available, we do not offer refunds on paid plans on
            the basis of dissatisfaction with detection results, accuracy, or general suitability for a customer's
            purposes.
          </p>

          <h3>2. Subscription Plans (Student, Pro, Team &amp; API)</h3>
          <ul>
            <li>Subscriptions are billed monthly in advance via PayFast.</li>
            <li>
              You may cancel your subscription at any time from your account dashboard. Cancellation stops future
              billing but does not generate a refund for the current billing period already paid for — you will
              retain access to your plan's features until the end of the period you have already paid for.
            </li>
            <li>
              We do not provide pro-rated or partial refunds for unused days, unused word/API quota, or early
              cancellation within a billing period.
            </li>
            <li>
              If you are charged after you cancelled, or charged the wrong amount due to a processing or system
              error on our part, contact us and we will investigate and refund the erroneous amount.
            </li>
            <li>Duplicate charges caused by a payment processing error will be refunded in full once verified.</li>
          </ul>

          <h3>3. Day Passes</h3>
          <p>
            Day Passes are once-off purchases granting temporary increased usage. Because a Day Pass is consumed as
            soon as it is activated, Day Passes are non-refundable once purchased and activated. If a Day Pass was
            purchased but never activated due to a technical fault on our side, contact us for a refund.
          </p>

          <h3>4. Student Plan Verification</h3>
          <p>
            The discounted Student plan requires proof of student status. If a Student subscription is found to have
            been obtained fraudulently (i.e., the subscriber is not a verified student), we reserve the right to
            cancel the subscription and upgrade or suspend the account, without refunding amounts already paid at
            the discounted rate.
          </p>

          <h3>5. How to Request a Refund</h3>
          <p>
            Refund requests relating to billing errors, duplicate charges, or technical failures should be sent to{" "}
            <a href="mailto:support@litimus.app">support@litimus.app</a>, including your account email address and
            the relevant transaction date/reference from PayFast. We aim to respond to all refund requests within 5
            business days.
          </p>

          <h3>6. Chargebacks</h3>
          <p>
            If you believe a charge was made in error, we ask that you contact us directly first so we can resolve
            it quickly. Initiating a chargeback with your bank or card issuer without first contacting us may result
            in suspension of your account while the dispute is investigated.
          </p>

          <h3>7. Governing Law</h3>
          <p>
            This policy is governed by the laws of South Africa, and nothing in this policy limits any rights you
            have under the Consumer Protection Act 68 of 2008 that cannot lawfully be excluded.
          </p>

          <h3>8. Changes to This Policy</h3>
          <p>
            We may update this Refund Policy from time to time. Changes will be posted on this page with an updated
            &quot;Last updated&quot; date.
          </p>

          <h3>9. Contact</h3>
          <p>
            Questions about this policy can be sent to <a href="mailto:support@litimus.app">support@litimus.app</a>.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
