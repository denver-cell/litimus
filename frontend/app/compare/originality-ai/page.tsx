import Link from "next/link";
import Article from "@/components/Article";
import CompareTable from "@/components/CompareTable";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/compare/originality-ai";
const TITLE = "Litimus vs Originality.ai: how they differ — Litimus";
const DESCRIPTION =
  "Originality.ai bundles AI detection with plagiarism and other checks for content teams; Litimus does one job. Plans, features and prices compared.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function CompareOriginalityPage() {
  return (
    <Article
      eyebrow="Compare"
      title="Litimus vs Originality.ai"
      lede="Originality.ai is built for publishers, agencies and web teams who scan content in volume and want plagiarism and other checks alongside AI detection. Litimus is narrower: it scores how machine-like a passage reads and shows you why."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[
        { name: "Compare", path: "/compare" },
        { name: "Originality.ai", path: PATH },
      ]}
      updated={CONTENT_UPDATED}
      related={[
        {
          href: "/for/writers-and-editors",
          title: "AI text detection for writers and editors",
          blurb: "Using a detector as a second opinion on drafts and submissions.",
        },
        {
          href: "/compare/gptzero",
          title: "Litimus vs GPTZero",
          blurb: "Another well-known detector, compared.",
        },
      ]}
    >
      <div className="callout">
        <p>
          <strong>The short version.</strong> If you need AI detection, plagiarism checking, readability and fact
          checking in one subscription, with team management on top, Originality.ai is built for that and Litimus is
          not. If you only need to know how a passage reads and why, Litimus is simpler and you can start without an
          account.
        </p>
      </div>

      <h2>Side by side</h2>
      <p>Prices below are as listed on Originality.ai’s pricing page on the review date. Check it for current figures.</p>
      <CompareTable
        caption="Litimus compared with Originality.ai"
        aName="Originality.ai"
        bName="Litimus"
        rows={[
          {
            label: "Built for",
            a: "Individuals and small teams on Pro, and agencies and publishers on Enterprise, according to its pricing page.",
            b: "Writers, editors, teachers and students who want a second opinion on a passage.",
          },
          {
            label: "Free option",
            a: "A free plan with 60 credits a month (three scans a day) and a 2,000-word limit per scan, AI detection only.",
            b: "2,000 words a day, no account. Free scans run in your browser and are not sent to Litimus servers.",
          },
          {
            label: "Individual paid plan",
            a: "Pro: $14.95 a month, or $12.95 a month billed annually, with 2,000 credits a month.",
            b: "Pro: $15 a month, or $12 a month billed yearly, with 25,000 words a day. Student: $8 a month.",
          },
          {
            label: "What else is included",
            a: "Pro adds plagiarism checking, readability analysis, grammar and spelling correction, fact checking, file uploads, website scanning, team management, custom tagging and a Chrome extension.",
            b: "Pro adds .docx and .pdf files, batch scans of up to 20 files and shareable reports. There is no plagiarism, grammar or fact checking.",
          },
          {
            label: "Team and API",
            a: "Enterprise adds API access, priority support, 365-day scan history and shareable reports, at $179 a month, or $136.58 a month billed annually.",
            b: (
              <>
                Team &amp; API from $49 a month with five seats and a <Link href="/docs/api">REST API</Link>.
              </>
            ),
          },
          {
            label: "Billing model",
            a: "Subscription credits that renew monthly. Credits bought separately expire after two years.",
            b: "Subscription tiers by daily word allowance, plus a one-time $5 day pass that adds 10,000 words for 24 hours.",
          },
          {
            label: "What the report shows",
            a: "See the vendor’s own pages for how it presents results.",
            b: "A 0–100 score with a label, readings for sentence rhythm, vocabulary spread, stock phrases and repeated phrases, and margin notes quoting the phrases found.",
          },
        ]}
      />
      <p>
        At close to the same monthly price, Originality.ai’s Pro plan bundles checks that Litimus’s Pro plan does not.
        That is the fair way to read the table: the difference is scope, not just price.
      </p>

      <h2>Where Originality.ai is the better choice</h2>
      <ul>
        <li>
          <strong>You publish at volume.</strong> Team management, tagging, website scanning and a Chrome extension
          support a content workflow.
        </li>
        <li>
          <strong>You want the other checks in the same place.</strong> Plagiarism, readability, grammar and fact
          checking are part of the same subscription.
        </li>
        <li>
          <strong>You need a longer scan history.</strong> Its Enterprise plan lists 365-day scan history.
        </li>
      </ul>

      <h2>Where Litimus is the better choice</h2>
      <ul>
        <li>
          <strong>You want to see what moved the score.</strong> Litimus is a short list of measurable signals rather
          than a bundle of checks. Read <Link href="/guides/how-ai-detectors-work">how AI detectors work</Link> for
          what those signals are.
        </li>
        <li>
          <strong>You are a student or an occasional user.</strong> An $8 Student plan, a free daily allowance, and a $5
          one-time pass suit a few checks around a deadline better than a monthly credit allowance.
        </li>
        <li>
          <strong>You only need the AI check.</strong> You are not paying for a suite you will not use.
        </li>
      </ul>

      <h2>What is true of both</h2>
      <p>
        Both tools give a probability, and neither can prove who wrote something. We have not benchmarked either tool
        and do not publish an accuracy ranking. If a piece of work matters, use a score as a reason to ask the writer
        about their process, not as a reason to reject it. Independent research has found that detectors misclassify
        non-native English writing more often, which is one reason a score should never be the only evidence. See{" "}
        <Link href="/guides/ai-detector-false-positives">the false positives guide</Link>.
      </p>

      <Sources
        items={[SRC.originalityPricing, SRC.liang]}
        note="Facts about Originality.ai come from its published pricing page as we read it on the date above. Plans and prices change, so check its site before you decide."
      />
    </Article>
  );
}
