import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides/how-ai-detectors-work";
const TITLE = "How AI detectors work — Litimus";
const DESCRIPTION =
  "How AI text detectors estimate whether writing is machine-made: predictability, sentence rhythm, trained classifiers, and why results are probabilities.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function HowDetectorsWorkPage() {
  return (
    <Article
      eyebrow="Guide"
      title="How AI detectors work"
      lede="An AI detector does not find a watermark or look anything up. It estimates how typical a passage is of machine-generated text and returns a probability. This guide explains what goes into that estimate and why it is never a certainty."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[
        { name: "Guides", path: "/guides" },
        { name: "How AI detectors work", path: PATH },
      ]}
      updated={CONTENT_UPDATED}
      isArticle
      related={[
        {
          href: "/guides/ai-detector-false-positives",
          title: "AI detector false positives",
          blurb: "What happens when honest writing looks machine-like.",
        },
        {
          href: "/compare",
          title: "Compare AI detectors",
          blurb: "How Litimus differs from GPTZero, Turnitin and Originality.ai.",
        },
      ]}
    >
      <h2>The basic idea</h2>
      <p>
        A language model writes by repeatedly choosing a likely next word. Because it favours likely choices, the text
        it produces tends to be predictable and evenly paced. Detectors try to measure that. They do not know how a
        particular piece of text was made. They measure how closely it resembles the patterns of generated text, and
        the closer it resembles them, the higher the score.
      </p>

      <h2>Two families of approach</h2>
      <p>
        <strong>Signal-based detectors</strong> measure properties of the text directly. Two classic ones are
        predictability (how surprising each word is to a language model, often called perplexity) and{" "}
        <em>burstiness</em> (how much sentence length and structure vary). Simple counts, such as how often stock
        transitions or repeated phrases appear, sit in the same family.
      </p>
      <p>
        <strong>Trained classifiers</strong> take a different route. A model is trained on large numbers of labelled
        examples of human and machine writing and learns to output a probability. Commercial tools may combine
        approaches. Vendors generally do not publish exactly what their systems measure, so we cannot tell you what any
        given product does inside.
      </p>
      <p>
        Litimus is signal-based. It scores six measurable signals and combines them with fixed weights, and the
        report shows you the readings. It is deliberately simple and transparent. That is a trade-off:
        it cannot see patterns that only a large trained model would pick up, and we do not claim it is more accurate
        than one.
      </p>

      <h2>The six signals Litimus uses</h2>
      <ol>
        <li>
          <strong>Sentence rhythm (burstiness).</strong> The spread of sentence lengths relative to their average.
          Very even sentences push the score up.
        </li>
        <li>
          <strong>Stock transitions.</strong> Connective phrases such as “moreover” and “it is important to note” from
          a fixed list, counted against the length of the passage.
        </li>
        <li>
          <strong>Vocabulary spread.</strong> Distinct words as a share of all words. A low share suggests repeated,
          safe word choices.
        </li>
        <li>
          <strong>Phrase repetition.</strong> Three-word sequences that occur more than once.
        </li>
        <li>
          <strong>Punctuation habits.</strong> Currently the frequency of em dashes.
        </li>
        <li>
          <strong>Structural symmetry.</strong> How similar sentence lengths are, measured in characters.
        </li>
      </ol>
      <p>
        The weights favour sentence rhythm most, then stock transitions and vocabulary spread. The result is a score
        from 2 to 98. A score of 66 or above is labelled AI-likely, 34 or below human-likely, and anything between them
        mixed / unclear.
      </p>

      <h2>Why the result is a probability</h2>
      <p>
        Human and machine text overlap. A careful writer can produce even, plain prose, and generated text that a human
        has rewritten can look entirely natural. Any threshold you draw will misplace some of each. So a good detector
        gives a score and a band, not a yes or no, and says that the middle of the range is inconclusive.
      </p>

      <h2>What makes detection harder</h2>
      <ul>
        <li>
          <strong>Short text.</strong> There is little to measure. OpenAI’s own withdrawn classifier was unreliable on
          text under 1,000 characters, and Litimus flags anything under 25 words as too short for a stable read.
        </li>
        <li>
          <strong>Editing.</strong> OpenAI noted that AI-written text can be edited to evade detection, and that
          predictable, formulaic writing is hard to classify either way.
        </li>
        <li>
          <strong>Other languages.</strong> OpenAI’s classifier was reliable only in English, and Litimus is tuned for
          English.
        </li>
        <li>
          <strong>Writing style.</strong> Independent research found that widely used detectors misclassified
          non-native English writing as AI-generated, possibly because a more constrained vocabulary and phrasing
          resembles the patterns detectors look for.
        </li>
      </ul>

      <h2>What no detector can do</h2>
      <p>
        No detector can prove who wrote something, identify which tool produced it, or tell you whether AI help was
        allowed. It can only say how much a passage resembles generated text. That is why Litimus’s{" "}
        <Link href="/terms">Terms of Service</Link> ask you not to treat a score as proof.
      </p>

      <h2>A cautionary example</h2>
      <p>
        In early 2023 OpenAI released a classifier for AI-written text and reported that it correctly identified 26% of
        AI-written text while wrongly labelling 9% of human-written text as AI-written. On 20 July 2023 it withdrew the
        tool, saying it was no longer available due to its low rate of accuracy. The detectors on the market today are
        different products, but the episode is a useful reminder to treat any score with caution.
      </p>

      <Sources items={[SRC.openai, SRC.liang]} />
    </Article>
  );
}
