import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/for/students";
const TITLE = "AI detection for students — Litimus";
const DESCRIPTION =
  "Check your own writing before you hand it in: what an AI detector looks at, why honest work sometimes scores high, and how to keep evidence that it is yours.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function StudentsPage() {
  return (
    <Article
      eyebrow="For students"
      title="AI text detection for students"
      lede="If your school uses an AI detector, it helps to see what one might see. Litimus lets you check your own writing and understand why a passage reads as machine-like, so you can explain your work if you are ever asked."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[{ name: "For students", path: PATH }]}
      updated={CONTENT_UPDATED}
      related={[
        {
          href: "/guides/falsely-accused-of-ai-writing",
          title: "Falsely accused of using AI?",
          blurb: "Practical steps if a detector flagged your own work.",
        },
        {
          href: "/guides/ai-detector-false-positives",
          title: "AI detector false positives",
          blurb: "Why honest writing gets flagged, and who is affected most.",
        },
      ]}
    >
      <div className="callout">
        <p>
          <strong>What this is for.</strong> Checking honest work. It is not a way around your school’s rules. If your
          course bans AI assistance or requires you to disclose it, a low score changes neither, and Litimus does not
          rewrite text for you. Follow your institution’s policy.
        </p>
      </div>

      <h2>Why check your own work</h2>
      <p>
        Detectors get honest writing wrong. Research has found that widely used detectors consistently misclassify
        writing by non-native English speakers as AI-generated, and formulaic or very tidy writing can score high too.
        Seeing your own report before your instructor sees theirs means you are not surprised, and you know which
        parts of the text triggered it.
      </p>

      <h2>How to read a report on your own draft</h2>
      <ol>
        <li>
          <strong>Paste your finished draft.</strong> Give it a full section. Passages under 25 words are too short for
          a stable read.
        </li>
        <li>
          <strong>Read the reasons, not just the number.</strong> The report shows readings for sentence rhythm,
          vocabulary spread, stock phrases and repeated phrases, and quotes the phrases it found.
        </li>
        <li>
          <strong>Ask whether the note is fair as an editing comment.</strong> If it says a paragraph leans on stock
          transitions like “moreover” or repeats the same three-word phrase, that may be worth fixing as plain editing,
          whatever the score. If the writing is yours and you are happy with it, leave it alone. Do not contort honest
          writing to please a number.
        </li>
      </ol>

      <h2>Keep your evidence</h2>
      <p>
        The best protection is a record of how the work was made. Write in a document that keeps its history, such as
        Google Docs or Word saved to OneDrive, and do not delete it afterwards. Keep your notes, outlines, source
        lists and any messages with tutors. If someone asks how you wrote something, that trail answers the question
        better than any detector can. More in{" "}
        <Link href="/guides/falsely-accused-of-ai-writing">what to do if you are falsely accused</Link>.
      </p>

      <h2>Your privacy</h2>
      <p>
        Free scans run in your browser and the text you paste is not sent to Litimus servers. Saved report history on
        paid plans is opt-in. See the <Link href="/privacy">privacy policy</Link> for the details.
      </p>

      <h2>Student pricing</h2>
      <p>
        The free tier covers 2,000 words a day with no account. The Student plan is $4 a month, requires student
        verification, and gives 25,000 words a day and .docx and .pdf files. If you only have one deadline, a $3 day
        pass adds 10,000 words for 24 hours. See the <Link href="/pricing">pricing page</Link>.
      </p>

      <Sources items={[SRC.liang, SRC.turnitinGuide]} />
    </Article>
  );
}
