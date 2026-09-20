import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/for/writers-and-editors";
const TITLE = "AI text detection for writers and editors — Litimus";
const DESCRIPTION =
  "Use an AI detector as a second opinion on drafts and submissions: the six signals in editorial terms, what to do with a borderline score, and Pro pricing.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function WritersEditorsPage() {
  return (
    <Article
      eyebrow="For writers and editors"
      title="AI text detection for writers and editors"
      lede="Editors and writers are asked more and more whether a piece was written by a person. A detector cannot answer that. It can point at passages that read as templated, which is often worth an editor’s attention anyway."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[{ name: "For writers and editors", path: PATH }]}
      updated={CONTENT_UPDATED}
      related={[
        {
          href: "/compare/originality-ai",
          title: "Litimus vs Originality.ai",
          blurb: "If you scan content in bulk, how a content-team suite differs.",
        },
        {
          href: "/guides/how-ai-detectors-work",
          title: "How AI detectors work",
          blurb: "What a score is built from, and why it is a probability.",
        },
      ]}
    >
      <h2>The six signals, in editorial terms</h2>
      <p>Litimus combines six measurements into one score. Each one corresponds to something an editor already looks for.</p>
      <ul>
        <li>
          <strong>Sentence rhythm.</strong> Human prose swings between short and long sentences. A passage where every
          sentence runs to about the same length reads as monotone.
        </li>
        <li>
          <strong>Stock transitions.</strong> “Moreover”, “it is important to note” and “in conclusion” are the
          connective filler an editor would cut.
        </li>
        <li>
          <strong>Vocabulary spread.</strong> A low ratio of distinct words to total words means the same safe word
          choices recur.
        </li>
        <li>
          <strong>Phrase repetition.</strong> The same three-word sequence turning up again and again is a copy-edit
          flag in any draft.
        </li>
        <li>
          <strong>Punctuation habits.</strong> Litimus currently counts em dash frequency. Heavy use is a habit of a
          lot of generated text, and of plenty of human writers.
        </li>
        <li>
          <strong>Structural symmetry.</strong> Sentences of near-identical length give a passage a templated feel.
        </li>
      </ul>
      <p>
        The full explanation, with the thresholds, is in <Link href="/guides/how-ai-detectors-work">how AI detectors work</Link>.
      </p>

      <h2>A second opinion, not a gatekeeper</h2>
      <ul>
        <li>
          <strong>Write your policy down first.</strong> Decide what counts as acceptable AI assistance for your
          publication or client and tell contributors before you scan anything.
        </li>
        <li>
          <strong>Never reject a piece on a score alone.</strong> A borderline result is inconclusive by design. Ask the
          writer about their process: notes, sources, earlier drafts.
        </li>
        <li>
          <strong>Use the reasons as edit notes.</strong> If the report flags stock transitions and repeated phrases,
          those are things you would want tightened whoever wrote them.
        </li>
        <li>
          <strong>Remember what a score cannot tell you.</strong> It cannot separate AI-assisted from AI-written, and
          heavily edited AI text can land in the middle of the range. Formulaic house styles can look templated to any
          statistical detector.
        </li>
      </ul>

      <h2>Plans</h2>
      <p>
        One-off checks are free: 2,000 words a day, no account, run in your browser. Pro is $15 a month (or $12 a month
        billed yearly) and adds 25,000 words a day, .docx and .pdf files, batch scans of up to 20 files and shareable
        reports. Team &amp; API starts at $49 a month with five seats and a <Link href="/docs/api">REST API</Link>. A
        $3 day pass adds 10,000 words for 24 hours. See the <Link href="/pricing">pricing page</Link>.
      </p>

      <Sources items={[SRC.openai, SRC.liang]} />
    </Article>
  );
}
