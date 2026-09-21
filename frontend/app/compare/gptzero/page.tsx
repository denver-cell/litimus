import Link from "next/link";
import Article from "@/components/Article";
import CompareTable from "@/components/CompareTable";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/compare/gptzero";
const TITLE = "GPTZero vs Litimus: Which AI Detector Fits You?";
const DESCRIPTION =
  "Litimus and GPTZero compared: languages, integrations, what each report shows, free limits and claims. Where GPTZero is stronger, and where Litimus fits.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function CompareGptzeroPage() {
  return (
    <Article
      eyebrow="Compare"
      title="Litimus vs GPTZero"
      lede="GPTZero is one of the best-known AI detectors, with integrations and language support that Litimus does not match. Litimus is a smaller tool that shows the signals behind its score. Here is how they differ."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[
        { name: "Compare", path: "/compare" },
        { name: "GPTZero", path: PATH },
      ]}
      updated={CONTENT_UPDATED}
      related={[
        {
          href: "/compare/turnitin",
          title: "Litimus vs Turnitin",
          blurb: "The institutional option, compared.",
        },
        {
          href: "/guides/ai-detector-false-positives",
          title: "AI detector false positives",
          blurb: "Why every detector, including ours, gets some honest writing wrong.",
        },
      ]}
    >
      <div className="callout">
        <p>
          <strong>The short version.</strong> Choose GPTZero if you need classroom integrations, languages other than
          English, or extras such as plagiarism checking and a writing replay in the same product. Choose Litimus if you
          want a plain report that names the signals behind the score, or a free check with no account that runs in
          your browser.
        </p>
      </div>

      <h2>Side by side</h2>
      <CompareTable
        caption="Litimus compared with GPTZero"
        aName="GPTZero"
        bName="Litimus"
        rows={[
          {
            label: "Built for",
            a: "Educators, students, publishers, recruiters and writers, according to its own site.",
            b: "Writers, editors, teachers and students who want a second opinion on a passage.",
          },
          {
            label: "What the report shows",
            a: "Sentence-level detection with colour-coded highlighting.",
            b: "A 0–100 score with a label (AI-likely, mixed / unclear, human-likely), readings for sentence rhythm, vocabulary spread, stock phrases and repeated phrases, and margin notes that quote the phrases found. It does not colour-code each sentence.",
          },
          {
            label: "Languages",
            a: "Lists English, German, Portuguese, French and Spanish.",
            b: "Tuned for English.",
          },
          {
            label: "Other features it lists",
            a: "Plagiarism detection, grammar feedback, a hallucination detector and a writing replay.",
            b: "None of these. Litimus scores how machine-like a passage reads and nothing else.",
          },
          {
            label: "Integrations",
            a: "A Chrome extension, Google Docs, Google Classroom, Canvas, Moodle, Zapier and an API.",
            b: (
              <>
                A web tool, plus a <Link href="/docs/api">REST API</Link> on the Team &amp; API plan. If you need a
                plug-in inside your LMS or word processor, check GPTZero’s current list first.
              </>
            ),
          },
          {
            label: "Free use",
            a: "Up to 10,000 characters per scan without an account, according to its site. That is roughly 1,500 to 2,000 words, depending on the text.",
            b: "2,000 words a day, no account. Free scans run in your browser and the text is not sent to Litimus servers.",
          },
          {
            label: "Accuracy claims",
            a: "Markets “99% accuracy” and says its detector is de-biased for ESL writers. These are the vendor’s own claims.",
            b: "No headline accuracy figure. Every report is labelled as a probability, and the Terms say a score is not proof.",
          },
          {
            label: "Pricing",
            a: (
              <>
                Free and paid plans. See <a href={SRC.gptzeroPricing.href} rel="noopener noreferrer">GPTZero’s pricing page</a> for
                current prices.
              </>
            ),
            b: (
              <>
                Free, Student $8/mo, Pro $15/mo, Team &amp; API from $49/mo, and a one-time $5 day pass. See{" "}
                <Link href="/pricing">pricing</Link>.
              </>
            ),
          },
        ]}
      />

      <h2>Where GPTZero is the better choice</h2>
      <ul>
        <li>
          <strong>You teach or write in another language.</strong> GPTZero lists German, Portuguese, French and
          Spanish alongside English. Litimus is tuned for English and is not a good fit elsewhere.
        </li>
        <li>
          <strong>You want it inside the tools you already use.</strong> A browser extension and Google Docs, Google
          Classroom, Canvas and Moodle integrations save copying and pasting for a whole class.
        </li>
        <li>
          <strong>You want to look at the writing process, not just the text.</strong> GPTZero lists a writing replay
          feature. Litimus only sees the finished text.
        </li>
        <li>
          <strong>You want plagiarism and grammar checks in one place.</strong> Litimus does not check for plagiarism.
        </li>
      </ul>

      <h2>Where Litimus is the better choice</h2>
      <ul>
        <li>
          <strong>You want to see why.</strong> Litimus is a small set of six measurable signals. The report shows the
          readings and quotes the stock phrases and repeated phrases it found, so you can judge for yourself whether
          they mean anything in your context. Read <Link href="/guides/how-ai-detectors-work">how detectors work</Link>{" "}
          for what those signals are.
        </li>
        <li>
          <strong>You want a quick check with no account.</strong> Paste, scan, done, with nothing sent to our servers
          for free scans.
        </li>
        <li>
          <strong>You have one deadline, not a subscription.</strong> A $5 day pass adds 10,000 words for 24 hours.
        </li>
      </ul>

      <h2>What is true of both</h2>
      <p>
        Both tools give a probability. A vendor claim of 99% accuracy still leaves errors, and errors add up: if one
        honest essay in a hundred is wrongly flagged, a class of thirty has roughly a one in four chance of at least
        one wrongly flagged student on a single assignment. That is an illustration of the arithmetic, not a measured
        rate for either tool.
      </p>
      <p>
        Independent research has also found that detectors in general misclassify writing by non-native English
        speakers more often. GPTZero says its detector is de-biased for ESL writers, and we say plainly that Litimus
        is not immune. Neither claim should replace your own judgement. We have not benchmarked either tool and do not
        publish an accuracy ranking. See <Link href="/guides/ai-detector-false-positives">the false positives guide</Link> for the details.
      </p>

      <Sources
        items={[SRC.gptzeroHome, SRC.gptzeroPricing, SRC.liang]}
        note="Facts about GPTZero come from its own published pages as we read them on the date above. Vendor features change, so check its site before you decide."
      />
    </Article>
  );
}
