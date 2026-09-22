import Link from "next/link";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import { CONTENT_UPDATED, SRC } from "@/lib/content";
import { getPublishedArticles } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";

const PATH = "/for/teachers";
const TITLE = "AI detection for teachers — Litimus";
const DESCRIPTION =
  "How teachers can use an AI text detector fairly: a five-step process, what a Litimus report shows, where detectors go wrong, and why a score is never proof.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

// Picks up newly-published articles without a redeploy (see lib/articles.ts).
export const revalidate = 3600;

export default function TeachersPage() {
  const recentArticles = getPublishedArticles("teachers", { limit: 6 });
  return (
    <Article
      eyebrow="For teachers"
      title="AI text detection for teachers"
      lede="A detector can tell you where to look. It cannot tell you what a student did. Here is a way to use Litimus as a prompt for a conversation rather than a verdict."
      description={DESCRIPTION}
      path={PATH}
      crumbs={[{ name: "For teachers", path: PATH }]}
      updated={CONTENT_UPDATED}
      related={[
        {
          href: "/guides/ai-detector-false-positives",
          title: "AI detector false positives",
          blurb: "Why honest students get flagged, and who is affected most.",
        },
        {
          href: "/compare/turnitin",
          title: "Litimus vs Turnitin",
          blurb: "If your school already licenses Turnitin, how the two differ.",
        },
        {
          href: "/guides/how-ai-detectors-work",
          title: "How AI detectors work",
          blurb: "What a score is actually built from.",
        },
      ]}
    >
      <div className="callout">
        <p>
          <strong>Ground rule.</strong> Litimus’s <Link href="/terms">Terms of Service</Link> ask you not to treat a
          score as conclusive or as the sole evidence of academic dishonesty. Turnitin’s guidance says the same about
          its own report. The process below is built around that.
        </p>
      </div>

      <h2>A fair five-step process</h2>
      <h3>1. Start with your policy, not the tool</h3>
      <p>
        A detector only matters against a rule students were told about. Check what your syllabus and institution say
        about AI assistance: banned, allowed with disclosure, or allowed for certain steps. If students were never
        told, a score is not a basis for anything.
      </p>

      <h3>2. Read the work yourself first</h3>
      <p>
        Does the piece sound like the student, given what you have seen in class and in earlier assignments? Does it
        engage with what you actually taught? Your reading is better evidence than any score.
      </p>

      <h3>3. Scan a full passage and read the reasons, not just the number</h3>
      <p>
        Paste in a whole section rather than a paragraph. Litimus will score from 8 words but says plainly that
        anything under 25 words is too short for a stable read, and longer passages give steadier results. Then read the
        readings and margin notes. A high score driven by a few stock transitions tells you something different from a
        high score driven by uniformly even sentences.
      </p>

      <h3>4. Compare against a baseline</h3>
      <p>
        Set the result next to the student’s earlier work and, where you have it, in-class writing. Ask for the draft
        history: Google Docs and Word both keep version history, and a document built up over several sessions looks very
        different from one pasted in whole.
      </p>

      <h3>5. Talk to the student before you conclude anything</h3>
      <p>
        Ask them to walk you through how they wrote it: where the ideas came from, why they structured it this way, what
        a particular sentence means. Assume good faith and keep notes. Turnitin’s own guidance advises educators to
        assume positive intent and to discuss findings openly with students.
      </p>

      <h2>What a Litimus report shows</h2>
      <ul>
        <li>A 0–100 score shown as “% AI-likely”, with a label: AI-likely (66 and above), mixed / unclear (35 to 65) or human-likely (34 and below).</li>
        <li>Readings for sentence rhythm, vocabulary spread, stock phrases and repeated phrases.</li>
        <li>Margin notes that quote the stock transitions and repeated three-word phrases found in the text.</li>
      </ul>
      <p>
        It does not show who wrote the text, which tool (if any) produced it, or whether AI use was allowed. The score
        is built from six measurable signals, listed in{" "}
        <Link href="/guides/how-ai-detectors-work">how AI detectors work</Link>.
      </p>

      <h2>Where it goes wrong</h2>
      <ul>
        <li>
          <strong>Non-native English writers.</strong> Independent research found that widely used detectors
          consistently misclassified non-native English writing as AI-generated. Litimus is not immune. Take extra
          care with English-language learners.
        </li>
        <li>
          <strong>Formulaic writing.</strong> Templates, lab reports, short answers and highly structured genres can
          read as even and repetitive without any AI involved.
        </li>
        <li>
          <strong>Edited AI text.</strong> Text that was generated and then rewritten by hand can land in the middle of
          the range, or lower.
        </li>
        <li>
          <strong>Borderline scores.</strong> Anything in the mixed / unclear band is inconclusive by design.
        </li>
      </ul>
      <p>
        More in <Link href="/guides/ai-detector-false-positives">why detectors produce false positives</Link>.
      </p>

      <h2>Plans for teaching</h2>
      <p>
        The free tier covers 2,000 words a day with no account, enough for a handful of spot checks. If you check work
        regularly, Pro is $15 a month (or $12 a month billed yearly) with 25,000 words a day, .docx and .pdf files and
        batch scans of up to 20 files. Team &amp; API starts at $49 a month with five seats for departments. A $5 day
        pass adds 10,000 words for 24 hours. Full details are on the <Link href="/pricing">pricing page</Link>.
      </p>
      <p>
        If your school already licenses Turnitin, that is the report your institution’s process will point to. See how
        it <Link href="/compare/turnitin">compares with Litimus</Link>.
      </p>

      {recentArticles.length > 0 && (
        <>
          <h2>Recent articles</h2>
          <div className="card-grid">
            {recentArticles.map((a) => (
              <Link key={a.slug} href={`/for/teachers/${a.slug}`} className="card-link">
                <b>{a.title}</b>
                <span>{a.description}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <Sources items={[SRC.turnitinGuide, SRC.turnitinFalsePositives, SRC.liang]} />
    </Article>
  );
}
