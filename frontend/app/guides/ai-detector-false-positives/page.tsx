import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides/ai-detector-false-positives";
const TITLE = "AI detector false positives — Litimus";
const DESCRIPTION =
  "Why AI detectors sometimes flag human writing, who is affected most, what the research and the vendors say, and how to read a borderline score responsibly.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function FalsePositivesPage() {
  return (
    <Article
      eyebrow="Guide"
      title="AI detector false positives: why honest writing gets flagged"
      lede="A false positive is human-written text that a detector labels as AI-generated. Every detector produces some, including ours. This guide explains why, who is affected most, and how to read a score without doing harm."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[
        { name: "Guides", path: "/guides" },
        { name: "False positives", path: PATH },
      ]}
      updated={CONTENT_UPDATED}
      isArticle
      related={[
        {
          href: "/guides/falsely-accused-of-ai-writing",
          title: "Falsely accused of using AI?",
          blurb: "Practical steps if a detector flagged your own work.",
        },
        {
          href: "/guides/how-ai-detectors-work",
          title: "How AI detectors work",
          blurb: "What a score is built from.",
        },
        {
          href: "/for/teachers",
          title: "AI detection for teachers",
          blurb: "A fair process for using a detector.",
        },
      ]}
    >
      <h2>What a false positive is</h2>
      <p>
        There are two ways a detector can be wrong. A <strong>false positive</strong> flags human writing as AI. A{" "}
        <strong>false negative</strong> lets AI writing through as human. False positives are the more serious error in
        education and employment, because they can land on someone who did nothing wrong.
      </p>

      <h2>Why they happen</h2>
      <p>
        Detectors measure resemblance to machine-generated patterns, and plenty of human writing resembles them.
      </p>
      <ul>
        <li>
          <strong>Predictable or formulaic text.</strong> Templates, lab reports, definitions and other structured
          genres are even and repetitive by design. OpenAI’s withdrawn classifier listed highly predictable text as
          something it could not classify reliably.
        </li>
        <li>
          <strong>A constrained vocabulary.</strong> Someone writing in a second language often uses common words and
          simple constructions. That resembles the low-variety pattern detectors look for.
        </li>
        <li>
          <strong>Short passages.</strong> With little text to measure, one unusual habit can swing the result.
        </li>
        <li>
          <strong>Heavy polish.</strong> Text edited until every sentence is tidy can lose the natural unevenness that
          detectors treat as human.
        </li>
      </ul>

      <h2>Who is affected most</h2>
      <p>
        A 2023 study in the journal Patterns tested several widely used GPT detectors and found that they consistently
        misclassified non-native English writing samples as AI-generated, while accurately identifying native writing.
        The authors suggested detectors may penalise writers with a more constrained linguistic range, and argued that
        using them in evaluative or educational settings raises ethical concerns, because they could unfairly
        disadvantage non-native English speakers.
      </p>
      <p>
        Vendors have responded since. GPTZero, for example, says its detector is de-biased for ESL writers. Those are
        the vendors’ own claims, and we have not verified them. Litimus makes no such claim: it is a simple
        signal-based tool tuned for English, and it is not immune to this problem.
      </p>

      <h2>What the vendors say about their own error rates</h2>
      <p>
        Turnitin says it targets a false positive rate below 1%, acknowledges a small risk remains, and says its
        AI writing report should not be the sole basis for adverse action against a student. It also hides scores
        between 1% and 19% behind an asterisk to reduce false positives. Those are careful statements, and they still
        leave room for wrongly flagged students.
      </p>

      <h2>Why a small rate still matters</h2>
      <p>
        Suppose a detector wrongly flags one honest document in a hundred. Across 10,000 honest documents that is about
        100 people. In a class of thirty honest students, the chance that at least one is wrongly flagged on a single
        assignment is roughly one in four, and it grows with every assignment. This is an illustration of the
        arithmetic, not a measured rate for any product. It is why a flag should start a conversation and not end one.
      </p>

      <h2>How Litimus tries to limit the harm</h2>
      <ul>
        <li>
          Middle scores, from 35 to 65, are labelled mixed / unclear rather than pushed to one side.
        </li>
        <li>
          The report shows the readings and quotes the phrases behind the score, so a reader can judge whether they
          mean anything in context.
        </li>
        <li>
          Passages under 25 words are flagged as too short for a stable read.
        </li>
        <li>
          Our <Link href="/terms">Terms of Service</Link> say a score is a probability and not proof, and ask you not to
          use it as the sole basis for a penalty.
        </li>
      </ul>
      <p>None of this removes false positives. It only makes them easier to spot.</p>

      <h2>How to read a borderline score</h2>
      <p>
        Treat it as inconclusive. Look at which signals drove it: a handful of stock transitions is a different story
        from uniformly even sentences. Compare against the writer’s other work. Ask about their process and ask to see
        drafts or version history. If the writer is a non-native English speaker, weigh the score even lower. And if
        you are the writer, read{" "}
        <Link href="/guides/falsely-accused-of-ai-writing">what to do if you are falsely accused</Link>.
      </p>

      <Sources items={[SRC.liang, SRC.turnitinFalsePositives, SRC.turnitinGuide, SRC.openai, SRC.gptzeroHome]} />
    </Article>
  );
}
