import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides/falsely-accused-of-ai-writing";
const TITLE = "Falsely accused of using AI? What to do — Litimus";
const DESCRIPTION =
  "If a detector flagged your own writing, here are practical steps: keep calm, gather drafts and version history, ask for the evidence, and respond in writing.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function FalselyAccusedPage() {
  return (
    <Article
      eyebrow="Guide"
      title="Falsely accused of using AI? What to do"
      lede="Being told your own work was written by AI is stressful, and a detector score is weaker evidence than it sounds. These steps help you respond calmly and with evidence."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[
        { name: "Guides", path: "/guides" },
        { name: "Falsely accused of using AI", path: PATH },
      ]}
      updated={CONTENT_UPDATED}
      isArticle
      cta={false}
      related={[
        {
          href: "/guides/ai-detector-false-positives",
          title: "AI detector false positives",
          blurb: "Why honest writing gets flagged and who is affected most.",
        },
        {
          href: "/for/students",
          title: "AI detection for students",
          blurb: "Checking your own work and keeping evidence.",
        },
      ]}
    >
      <div className="callout">
        <p>
          <strong>General information, not legal advice.</strong> Processes differ between schools, employers and
          publishers. Follow the procedure that applies to you and seek advice from your student union, ombudsperson,
          HR department or a lawyer if the stakes are high.
        </p>
      </div>

      <h2>First, do not delete anything</h2>
      <p>
        Keep every draft, note, outline and file exactly as it is. Do not edit the disputed document and do not
        backdate anything. Your record of how the work was made is your best evidence.
      </p>

      <h2>Steps to take</h2>
      <ol>
        <li>
          <strong>Ask exactly what is alleged and what the evidence is.</strong> Is it a detector score alone? Ask which
          tool, what the report says, and which policy or rule applies. Ask for the process in writing.
        </li>
        <li>
          <strong>Gather your evidence.</strong> Version history from Google Docs or from Word files saved to
          OneDrive or SharePoint, earlier drafts, notes, outlines, source lists, timestamps, and messages with tutors
          or editors. A document built up over several sessions looks very different from one pasted in whole.
        </li>
        <li>
          <strong>Be ready to talk through your work.</strong> Explain why you made your choices, define the terms you
          used, expand on an argument, or write a paragraph on the same topic if you are offered the chance. Being able
          to discuss the work in detail is persuasive.
        </li>
        <li>
          <strong>Point, politely, to the limits of the tool.</strong> Turnitin’s own guidance says AI writing
          detection may not always be accurate and should not be the sole basis for adverse action against a student.
          Independent research has found that detectors misclassify non-native English writing more often. OpenAI
          withdrew its own classifier over a low rate of accuracy. See{" "}
          <Link href="/guides/ai-detector-false-positives">why detectors produce false positives</Link>.
        </li>
        <li>
          <strong>Respond in writing, calmly and factually.</strong> Keep copies of everything you send and receive.
          Find out what the appeal process is and what the deadlines are, and use them.
        </li>
        <li>
          <strong>Get support.</strong> A student union, academic adviser or ombudsperson, or at work an HR contact or
          union representative, can help you navigate the process.
        </li>
      </ol>

      <h2>What not to do</h2>
      <ul>
        <li>
          <strong>Do not run your work through “humanizer” or paraphrasing tools.</strong> They change your text,
          muddy your evidence, may breach the rules, and can make you look guilty of the thing you are denying.
        </li>
        <li>
          <strong>Do not rewrite the document and resubmit it as if nothing happened.</strong> Keep the original as it
          was.
        </li>
        <li>
          <strong>Do not rely on a second detector as proof.</strong> Checking your writing with another tool, including
          Litimus, can add context, but a low score from one detector is no more conclusive than a high score from
          another.
        </li>
      </ul>

      <h2>If you are the one making the accusation</h2>
      <p>
        A score is a reason to look more closely, not a finding. Read the work yourself, compare it with earlier work,
        ask about the writer’s process, and give them a chance to respond before you conclude anything. See{" "}
        <Link href="/for/teachers">a fair process for teachers</Link> and{" "}
        <Link href="/for/writers-and-editors">for writers and editors</Link>.
      </p>

      <Sources items={[SRC.turnitinGuide, SRC.turnitinFalsePositives, SRC.liang, SRC.openai]} />
    </Article>
  );
}
