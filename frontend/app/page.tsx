import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Detector from "@/components/Detector";
import Faq from "@/components/Faq";
import PricingTable from "@/components/PricingTable";

export default function HomePage() {
  return (
    <>
      <Nav />

      <section className="hero">
        <div className="wrap hero-top">
          <div>
            <div className="eyebrow">Text forensics, not guesswork</div>
            <h1>
              The litmus test
              <br />
              for writing that matters.
            </h1>
            <p className="hero-sub">
              Litimus scores rhythm, phrasing, and repetition the way an editor reads a manuscript — then shows its
              work sentence by sentence, so you can see exactly why it turned the color it did.
            </p>
            <div className="hero-ctas">
              <Link href="#detector" className="btn">
                Scan a passage — free
              </Link>
              <Link href="/pricing" className="btn btn-ghost">
                See plans
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <b>6</b>signals scored per passage
              </div>
              <div>
                <b>&lt;1s</b>to analyze 2,000 words
              </div>
              <div>
                <b>0</b>text stored without consent
              </div>
            </div>
          </div>

          <Detector />
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Process</div>
            <h2>Three steps, no upload queue.</h2>
            <p>Everything below runs the moment you paste text — nothing leaves your session unless you save a report.</p>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-num mono">01</div>
              <h3>Paste or drop a file</h3>
              <p>Plain text, a Google Doc link, or .docx / .pdf on paid plans. 25-word minimum for a stable read.</p>
            </div>
            <div className="how-step">
              <div className="how-num mono">02</div>
              <h3>Litimus reads it line by line</h3>
              <p>Sentence rhythm, phrase frequency, vocabulary spread, and repetition are scored independently, then combined.</p>
            </div>
            <div className="how-step">
              <div className="how-num mono">03</div>
              <h3>Get a scored, annotated report</h3>
              <p>A single likelihood score plus margin notes pointing at exactly which sentences moved it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="signals-explain" id="signals">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Under the hood</div>
            <h2>What Litimus actually measures.</h2>
            <p>No black box score. Every signal below is visible in your report.</p>
          </div>
          <div className="sig-list">
            <div className="sig-item">
              <h3>
                <span className="n">01</span> Burstiness
              </h3>
              <p>Human sentences swing between short and long; AI output tends toward a narrow, even rhythm. Low variance raises the score.</p>
            </div>
            <div className="sig-item">
              <h3>
                <span className="n">02</span> Stock transitions
              </h3>
              <p>Phrases like &quot;moreover,&quot; &quot;it is important to note,&quot; and &quot;in conclusion&quot; cluster far more densely in generated text.</p>
            </div>
            <div className="sig-item">
              <h3>
                <span className="n">03</span> Vocabulary spread
              </h3>
              <p>A low ratio of unique words to total words suggests safe, repeated word choices rather than a wide natural vocabulary.</p>
            </div>
            <div className="sig-item">
              <h3>
                <span className="n">04</span> Phrase repetition
              </h3>
              <p>Repeated three-word sequences across a passage are rare in human drafts and common in generated ones.</p>
            </div>
            <div className="sig-item">
              <h3>
                <span className="n">05</span> Punctuation fingerprint
              </h3>
              <p>Overuse of em dashes and semicolons, or an absence of the small errors humans make, both shift the score.</p>
            </div>
            <div className="sig-item">
              <h3>
                <span className="n">06</span> Structural symmetry
              </h3>
              <p>Paragraphs of near-identical length and matching openers read as templated rather than composed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="honesty">
        <div className="wrap">
          <div>
            <div className="section-eyebrow mono">Fine print, upfront</div>
            <h2>Detectors are evidence, not verdicts.</h2>
            <p>
              We&apos;d rather lose a sale than oversell what statistical detection can do. Every report on Litimus
              carries the same caveats we&apos;re stating here.
            </p>
          </div>
          <ul className="honesty-list">
            <li>
              <span className="mono">01</span>Heavily edited AI text and unusual human styles can both land in the
              middle of the range — treat borderline scores as inconclusive.
            </li>
            <li>
              <span className="mono">02</span>No score from Litimus, or any competitor, should be the sole basis for
              an academic or employment penalty.
            </li>
            <li>
              <span className="mono">03</span>Non-native English writing is sometimes flagged more often; we tune
              against this, but it isn&apos;t solved industry-wide.
            </li>
            <li>
              <span className="mono">04</span>Short passages under 25 words don&apos;t carry enough signal for a
              stable read, and we say so instead of guessing.
            </li>
          </ul>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Pricing</div>
            <h2>Pay for how often you check, not for access to checking.</h2>
            <p>Every tier includes the full margin-notes report. Higher tiers add volume, file types, and integrations.</p>
          </div>
          <PricingTable />
        </div>
      </section>

      <Faq />

      <section className="cta">
        <div className="wrap">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            Ready when you are
          </div>
          <h2 style={{ marginLeft: "auto", marginRight: "auto" }}>
            Paste your first passage. It&apos;s free, and it takes less time than reading this footer.
          </h2>
          <Link href="#detector" className="btn">
            Scan a passage
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
