import Link from "next/link";
import Article from "@/components/Article";
import { CONTENT_UPDATED } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides";
const TITLE = "Guides to AI text detection — Litimus";
const DESCRIPTION =
  "Plain-language guides on how AI detectors work, why they produce false positives, and what to do if a detector flags your own writing.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function GuidesHubPage() {
  return (
    <Article
      eyebrow="Guides"
      title="Guides to AI text detection"
      lede="Plain-language explanations of what AI detectors measure, where they fail, and what to do when a score looks wrong. Written to be useful whichever tool you use."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[{ name: "Guides", path: PATH }]}
      updated={CONTENT_UPDATED}
      cta={false}
    >
      <h2>Start here</h2>
      <div className="card-grid">
        <Link href="/guides/how-ai-detectors-work" className="card-link">
          <b>How AI detectors work</b>
          <span>What a score is built from, the two main approaches, and why every result is a probability.</span>
        </Link>
        <Link href="/guides/ai-detector-false-positives" className="card-link">
          <b>AI detector false positives</b>
          <span>Why honest writing gets flagged, who is affected most, and how to read a borderline score.</span>
        </Link>
        <Link href="/guides/falsely-accused-of-ai-writing" className="card-link">
          <b>Falsely accused of using AI?</b>
          <span>Practical steps if a detector flagged your own work.</span>
        </Link>
      </div>

      <h2>By role</h2>
      <div className="card-grid">
        <Link href="/for/teachers" className="card-link">
          <b>For teachers</b>
          <span>A fair five-step process for using a detector without treating it as proof.</span>
        </Link>
        <Link href="/for/students" className="card-link">
          <b>For students</b>
          <span>Checking your own writing and keeping evidence that it is yours.</span>
        </Link>
        <Link href="/for/writers-and-editors" className="card-link">
          <b>For writers and editors</b>
          <span>The six signals in editorial terms, and using a score as a second opinion.</span>
        </Link>
      </div>

      <h2>Comparing tools</h2>
      <p>
        Choosing between detectors? See how <Link href="/compare/gptzero">GPTZero</Link>,{" "}
        <Link href="/compare/turnitin">Turnitin</Link> and <Link href="/compare/originality-ai">Originality.ai</Link>{" "}
        differ from Litimus, or start at the <Link href="/compare">comparison overview</Link>.
      </p>
    </Article>
  );
}
