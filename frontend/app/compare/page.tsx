import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/compare";
const TITLE = "Litimus vs GPTZero, Turnitin & Originality.ai — Compared";
const DESCRIPTION =
  "How Litimus differs from GPTZero, Turnitin and Originality.ai: who each tool is built for, what its report shows, and when the other tool is the better fit.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function CompareHubPage() {
  return (
    <Article
      eyebrow="Compare"
      title="How Litimus compares with other AI detectors"
      lede="Every AI detector returns a probability, not proof. What differs is who the tool is built for, what its report shows you, and what it costs. These pages set out the differences as plainly as we can, including where the other tool is the better choice."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[{ name: "Compare", path: PATH }]}
      updated={CONTENT_UPDATED}
      related={[
        {
          href: "/guides/how-ai-detectors-work",
          title: "How AI detectors work",
          blurb: "What the scores are built from, and why they are probabilities.",
        },
        {
          href: "/guides/ai-detector-false-positives",
          title: "AI detector false positives",
          blurb: "Why honest writing sometimes gets flagged, and who is affected most.",
        },
      ]}
    >
      <h2>The comparisons</h2>
      <div className="card-grid">
        <Link href="/compare/gptzero" className="card-link">
          <b>Litimus vs GPTZero</b>
          <span>A well-known detector with classroom integrations and more languages, against a smaller tool that names its signals.</span>
        </Link>
        <Link href="/compare/turnitin" className="card-link">
          <b>Litimus vs Turnitin</b>
          <span>An institutional AI Writing Report against a tool anyone can use without a school licence.</span>
        </Link>
        <Link href="/compare/originality-ai" className="card-link">
          <b>Litimus vs Originality.ai</b>
          <span>A content-team suite with plagiarism and other checks, against a single-purpose detector.</span>
        </Link>
      </div>

      <h2>How we compare</h2>
      <p>
        We use each vendor’s own published pages for what its product does and costs, and independent research for
        claims about how detectors behave. Where a vendor publishes an accuracy figure we say so, and we say it is the
        vendor’s figure. We do not publish an accuracy ranking, because we have not run a benchmark that you could
        check for yourself, and a number we could not back up would be worth less than none.
      </p>
      <p>
        Plans, prices and features change. Every comparison carries a “last reviewed” date and links to the pages it
        relied on. If something is out of date, tell us at{" "}
        <a href="mailto:support@litimus.app">support@litimus.app</a> and we will correct it.
      </p>
      <p>
        Litimus is not affiliated with GPTZero, Turnitin or Originality.ai. Those names belong to their owners and are
        used here only to identify the products we are comparing.
      </p>

      <h2>Which kind of tool do you need?</h2>
      <p>
        <strong>An institution’s detector.</strong> If your school or university licenses a tool such as Turnitin, that
        is the one your institution’s policy will refer to, and it sits inside the submission workflow. A second tool
        does not replace it.
      </p>
      <p>
        <strong>A suite for content teams.</strong> If you publish at volume and want plagiarism, readability and other
        checks in the same place as AI detection, look at a bundled product such as Originality.ai.
      </p>
      <p>
        <strong>A simple second opinion with visible reasoning.</strong> That is what Litimus is for. It scores six
        writing signals, shows you the readings and the phrases behind them, and works without an account. It does one
        job and does not check for plagiarism.
      </p>

      <h2>One rule that applies to every tool</h2>
      <p>
        No detector should be the sole basis for penalising someone. Turnitin says so in its own guidance, our{" "}
        <Link href="/terms">Terms of Service</Link> say so, and OpenAI withdrew its own AI text classifier in July
        2023 citing a low rate of accuracy. Read <Link href="/guides/ai-detector-false-positives">why detectors produce false positives</Link>{" "}
        before you rely on any score, ours included.
      </p>

      <Sources items={[SRC.turnitinGuide, SRC.openai]} />
    </Article>
  );
}
