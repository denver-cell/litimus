"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  analyze,
  verdictLabel,
  burstinessLabel,
  vocabLabel,
  phraseLabel,
  repeatLabel,
  improvementTips,
  MIN_WORDS_TO_SCORE,
  type AnalysisResult,
} from "@/lib/analyze";

const DEFAULT_TEXT =
  "In today's fast-paced digital landscape, it is important to note that effective communication has become increasingly essential. Moreover, organizations must adapt to changing circumstances in order to remain competitive. Furthermore, it is crucial to leverage innovative solutions that drive meaningful results. In conclusion, businesses that embrace these strategies will undoubtedly thrive.";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitSentencesRaw(text: string): string[] {
  const result: string[] = [];
  const re = /[^.!?]+[.!?]+|[^.!?]+$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0].length) result.push(m[0]);
  }
  return result.length ? result : [text];
}

function highlightMatches(escapedHtml: string, r: AnalysisResult): string {
  let html = escapedHtml;
  (r.hitPhrases || []).forEach((phrase) => {
    const re = new RegExp("(" + escapeRegex(phrase) + ")", "gi");
    html = html.replace(re, '<mark class="hl-phrase">$1</mark>');
  });
  (r.repeatedPhrases || []).forEach((rp) => {
    const re = new RegExp(
      "\\b(" + rp.phrase.split(" ").map(escapeRegex).join("\\s+") + ")\\b",
      "gi"
    );
    html = html.replace(re, '<span class="hl-repeat">$1</span>');
  });
  return html;
}

function renderHighlightedBackdrop(text: string, r: AnalysisResult): string {
  const sentences = splitSentencesRaw(text);
  const wordCounts = sentences.map((s) => words(s).length);
  const meanWc = wordCounts.reduce((a, b) => a + b, 0) / Math.max(wordCounts.length, 1);
  const showUniform = r.burstiness < 0.55 && sentences.length > 2;

  let out = "";
  sentences.forEach((s, i) => {
    const inner = highlightMatches(escapeHtml(s), r);
    const isUniform =
      showUniform && meanWc > 0 && wordCounts[i] >= 4 && Math.abs(wordCounts[i] - meanWc) <= meanWc * 0.25;
    out += isUniform ? `<span class="hl-uniform">${inner}</span>` : inner;
  });
  return out + "\n";
}

export default function Detector() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [scanning, setScanning] = useState(false);
  const [scanWidth, setScanWidth] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [backdropHtml, setBackdropHtml] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(() => words(text).length, [text]);
  const verdict = result ? verdictLabel(result.score) : null;
  const tips = result ? improvementTips(result) : [];

  useEffect(() => {
    // Any edit invalidates the last scan's highlights.
    setBackdropHtml(escapeHtml(text) + "\n");
  }, [text]);

  function syncScroll() {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setUploadStatus("That file is over 10MB — try a shorter document or paste the text directly.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    setUploadStatus(`Reading ${file.name}…`);

    try {
      let extracted = "";
      if (ext === "txt") {
        extracted = await file.text();
      } else if (ext === "docx") {
        const mammoth = await import("mammoth/mammoth.browser");
        const arrayBuffer = await file.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer });
        extracted = res.value;
      } else if (ext === "pdf") {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageTexts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pageTexts.push(content.items.map((it: any) => it.str).join(" "));
        }
        extracted = pageTexts.join("\n\n");
      } else {
        setUploadStatus("Unsupported file type — use .txt, .docx, or .pdf.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      extracted = extracted.trim();
      if (!extracted) {
        setUploadStatus("Couldn't find any readable text in that file — try pasting it instead.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setText(extracted);
      setResult(null);
      setUploadStatus(`${file.name} loaded — ${words(extracted).length} words. Hit Scan passage when ready.`);
    } catch {
      setUploadStatus("Could not read that file — try pasting the text instead.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function runScan() {
    const trimmed = text.trim();
    if (words(trimmed).length < MIN_WORDS_TO_SCORE) {
      setResult(null);
      return;
    }
    setScanning(true);
    setScanWidth(0);
    requestAnimationFrame(() => setScanWidth(100));

    window.setTimeout(() => {
      const r = analyze(trimmed);
      if (result) setLastScore(result.score);
      setBackdropHtml(renderHighlightedBackdrop(trimmed, r));
      setResult(r);
      setScanning(false);
    }, 550);
  }

  async function downloadReport() {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const v = verdictLabel(result.score);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 44;
    const pageHeight = 842;
    const pageWidth = 595 - marginX * 2;
    let y = 56;

    function ensureSpace(needed: number) {
      if (y + needed > pageHeight - 50) {
        doc.addPage();
        y = 56;
      }
    }
    function heading(t: string) {
      ensureSpace(24);
      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.setTextColor(61, 90, 128);
      doc.text(t, marginX, y);
      y += 16;
      doc.setTextColor(27, 36, 48);
    }
    function bodyLines(t: string, indent: number) {
      const lines = doc.splitTextToSize(t, pageWidth - indent);
      ensureSpace(lines.length * 13 + 6);
      doc.setFont("courier", "normal");
      doc.setFontSize(9.5);
      doc.text(lines, marginX + indent, y);
      y += lines.length * 13 + 8;
    }

    doc.setFont("courier", "bold");
    doc.setFontSize(16);
    doc.text("LITIMUS — SCAN REPORT", marginX, y);
    y += 22;

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 120);
    doc.text(`Generated ${new Date().toLocaleString()}   ·   Word count: ${result.wordCount}`, marginX, y);
    doc.setTextColor(27, 36, 48);
    y += 26;

    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.text(`${v.label}  —  ${result.score}% AI-likely`, marginX, y);
    y += 24;

    heading("SIGNALS, EXPLAINED");
    bodyLines(
      `Sentence rhythm: ${result.burstiness.toFixed(2)} (${burstinessLabel(result.burstiness)}). Scale runs 0 to 1+, where 0 means every sentence is nearly the same length — a pattern common in generated text — and 1+ means length swings widely between short and long sentences, which is typical of human writing.`,
      8
    );
    bodyLines(
      `Vocabulary spread: ${(result.ttr * 100).toFixed(0)}% (${vocabLabel(result.ttr)}). This is the share of unique words out of total words used. Below ~45% suggests safe, repeated word choices; above ~72% suggests a wide natural vocabulary.`,
      8
    );
    bodyLines(
      `Stock AI phrases: ${result.phraseHits} found (${phraseLabel(result.phraseHits)}). These are common connector phrases — moreover, furthermore, it is important to note, and similar — that appear far more densely in generated text than in most human drafts.`,
      8
    );
    bodyLines(
      `Repeated phrases: ${result.repeats} found (${repeatLabel(result.repeats)}). Counts exact three-word sequences that appear more than once — reusing the same short phrase verbatim is uncommon in edited human writing.`,
      8
    );
    y += 4;

    heading("WHAT WAS FLAGGED");
    bodyLines(
      result.hitPhrases.length ? `Stock transitions: "${result.hitPhrases.join('", "')}"` : "No stock AI transitions detected.",
      8
    );
    if (result.repeats > 0) {
      const list = result.repeatedPhrases
        .map((p) => `"${p.phrase}"${p.count > 2 ? ` (×${p.count})` : ""}`)
        .join(", ");
      bodyLines(`Repeated three-word phrases: ${list}${result.repeats > result.repeatedPhrases.length ? ", and others" : ""}`, 8);
    } else {
      bodyLines("No repeated three-word phrases detected.", 8);
    }
    y += 4;

    heading("HOW TO IMPROVE THIS SCORE");
    tips.forEach((tip) => bodyLines(`- ${tip}`, 8));
    y += 10;

    doc.setFont("courier", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 120);
    const disclaimer = doc.splitTextToSize(
      "No detector — including Litimus — can prove authorship with certainty. This score reflects statistical writing patterns, not a verified fact. Treat it as a starting signal, especially for anything with real consequences.",
      pageWidth
    );
    ensureSpace(disclaimer.length * 11 + 10);
    doc.text(disclaimer, marginX, y);
    y += disclaimer.length * 11 + 20;
    doc.setTextColor(27, 36, 48);

    ensureSpace(50);
    doc.setDrawColor(217, 212, 198);
    doc.line(marginX, y, marginX + pageWidth, y);
    y += 18;
    doc.setFont("courier", "bold");
    doc.setFontSize(9.5);
    doc.text("Made the edits above? Rescan free at litimus.app", marginX, y);
    y += 14;
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 110, 120);
    doc.text("Need more than 2,000 words a day? A one-time day pass or a Student plan starts at $3.", marginX, y);

    doc.save(`litimus-report-${Date.now()}.pdf`);
  }

  const scoreDelta = result && lastScore !== null ? result.score - lastScore : 0;

  return (
    <div className="panel" id="detector">
      <div className="panel-head">
        <span>MANUSCRIPT.TXT</span>
        <div className="dots">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="editor-wrap">
        <div
          ref={backdropRef}
          className="highlight-backdrop"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: backdropHtml }}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={syncScroll}
          placeholder="Paste a paragraph or two to see how Litimus reads it…"
        />
      </div>
      <div className="trust-line">
        <span className="dot" />
        Processed in your browser — never stored or sent anywhere unless you download the report.
      </div>
      <div className="scan-line" style={{ width: `${scanWidth}%` }} />
      <div className="panel-foot">
        <div className="foot-left">
          <span className="wordcount">{wordCount} words</span>
          <label className="upload-link" htmlFor="fileInput">
            ⇪ Upload .txt / .docx / .pdf
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="fileInput"
            accept=".txt,.docx,.pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        <button className="btn" onClick={runScan} disabled={scanning}>
          {scanning ? "Scanning…" : "Scan passage"}
        </button>
      </div>
      <div className="upload-status">{uploadStatus}</div>

      {result && verdict && (
        <div className="results show">
          <div className="verdict-row">
            <div className="gauge">
              <div className="gauge-track">
                <div className="gauge-fill" />
                <div className="gauge-marker" style={{ left: `${result.score}%` }} />
              </div>
              <div className="gauge-labels">
                <span>Human</span>
                <span>Mixed</span>
                <span>AI-likely</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="verdict-score mono">{result.score}%</div>
              <span className={`verdict-tag ${verdict.className}`}>{verdict.label}</span>
              {scoreDelta !== 0 && (
                <span className={`score-delta ${scoreDelta < 0 ? "down" : "up"}`}>
                  {scoreDelta < 0 ? "↓" : "↑"} {Math.abs(scoreDelta)} pts since last scan
                </span>
              )}
            </div>
          </div>

          <div className="signals">
            <div className="signal">
              <div className="signal-label">Sentence rhythm</div>
              <div className="signal-val mono">{result.burstiness.toFixed(2)}</div>
              <div className="signal-sub">{burstinessLabel(result.burstiness)}</div>
            </div>
            <div className="signal">
              <div className="signal-label">Vocab spread</div>
              <div className="signal-val mono">{(result.ttr * 100).toFixed(0)}%</div>
              <div className="signal-sub">{vocabLabel(result.ttr)}</div>
            </div>
            <div className="signal">
              <div className="signal-label">Stock phrases</div>
              <div className="signal-val mono">{result.phraseHits}</div>
              <div className="signal-sub">{phraseLabel(result.phraseHits)}</div>
            </div>
            <div className="signal">
              <div className="signal-label">Repeated phrases</div>
              <div className="signal-val mono">{result.repeats}</div>
              <div className="signal-sub">{repeatLabel(result.repeats)}</div>
            </div>
          </div>

          <div className="margin-notes">
            <h4>Margin notes</h4>
            {result.hitPhrases.length ? (
              <div className="note">
                <span className="marker">◆</span>
                <div>
                  <b>Stock transitions found:</b> &quot;{result.hitPhrases.slice(0, 6).join('", "')}&quot;. These are
                  common connector phrases (moreover, furthermore, it is important to note…) that show up far more
                  densely in generated text than in most human drafts — one or two is unremarkable, but a cluster of
                  them is a meaningful signal.
                </div>
              </div>
            ) : (
              <div className="note human">
                <span className="marker">◆</span>
                <div>No stock AI transitions detected — a human-typical signal.</div>
              </div>
            )}
            <div className={`note ${result.burstiness < 0.5 ? "" : "human"}`}>
              <span className="marker">◆</span>
              <div>
                <b>Sentence rhythm: {result.burstiness.toFixed(2)}</b> on a 0–1+ scale, where 0 means every sentence
                is nearly the same length (AI-typical) and 1+ means length swings widely between short and long
                sentences (human-typical). This passage reads as {burstinessLabel(result.burstiness).toLowerCase()}.
              </div>
            </div>
            <div className={`note ${result.ttr < 0.6 ? "" : "human"}`}>
              <span className="marker">◆</span>
              <div>
                <b>Vocabulary spread: {(result.ttr * 100).toFixed(0)}%</b> unique words out of total words used.
                Below ~45% suggests safe, repeated word choices; above ~72% suggests a wide natural vocabulary. This
                passage is {vocabLabel(result.ttr).toLowerCase()}.
              </div>
            </div>
            {result.repeats > 0 ? (
              <div className="note">
                <span className="marker">◆</span>
                <div>
                  <b>
                    {result.repeats} repeated three-word phrase{result.repeats > 1 ? "s" : ""}
                  </b>{" "}
                  found:{" "}
                  {result.repeatedPhrases
                    .map((p) => `"${p.phrase}"${p.count > 2 ? ` (×${p.count})` : ""}`)
                    .join(", ")}
                  {result.repeats > result.repeatedPhrases.length ? ", and others" : ""}. Reusing the exact same
                  short phrase multiple times is uncommon in edited human writing.
                </div>
              </div>
            ) : (
              <div className="note human">
                <span className="marker">◆</span>
                <div>No repeated three-word phrases found — a human-typical signal.</div>
              </div>
            )}
          </div>

          <div className="improve-box">
            <h4>How to improve this score</h4>
            <ul>
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="rescan-cta">
            <p>
              Edit your draft with the notes above, then paste the revised version back in — most writers see a real
              shift after a few targeted changes.
            </p>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                document.getElementById("detector")?.scrollIntoView({ behavior: "smooth", block: "center" });
                textareaRef.current?.focus();
              }}
            >
              Scan the edited version
            </button>
          </div>

          <div className="disclaimer">
            No detector — including this one — can prove authorship with certainty. Scores reflect statistical
            writing patterns, not a verified fact. Treat results as a starting signal, especially for anything with
            real consequences.
          </div>
          <div className="report-row">
            <button className="btn btn-ghost btn-sm" onClick={downloadReport}>
              ⬇ Download report (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
