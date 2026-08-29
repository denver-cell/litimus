// Litimus heuristic detection engine.
//
// This is the same scoring logic that originally shipped inline in the
// static landing page (index.html), ported to TypeScript so it can run
// client-side (free/instant scans) and be shared conceptually with the
// server-side copy in litmus-backend (backend/lib/analyze.ts), which the
// API uses for authenticated/higher-volume scans and for anything that
// needs to be trusted (usage billing, saved report history).
//
// NOTE: keep this file's scoring behavior in sync with the backend copy.
// A future refactor could hoist both into a shared npm package once the
// two apps share a monorepo tool (e.g. Turborepo).

export interface RepeatedPhrase {
  phrase: string;
  count: number;
}

export interface AnalysisResult {
  score: number; // 0-100, higher = more AI-likely
  burstiness: number;
  ttr: number; // type-token ratio (vocabulary spread)
  phraseHits: number;
  hitPhrases: string[];
  repeats: number;
  repeatedPhrases: RepeatedPhrase[];
  emdash: number;
  sentenceCount: number;
  wordCount: number;
}

export type Verdict = "AI-LIKELY" | "HUMAN-LIKELY" | "MIXED / UNCLEAR";

const AI_PHRASES = [
  "it is important to note",
  "in today's",
  "fast-paced",
  "moreover",
  "furthermore",
  "in conclusion",
  "undoubtedly",
  "leverage",
  "delve into",
  "in summary",
  "it is crucial",
  "increasingly",
  "meaningful results",
  "innovative solutions",
  "navigate the",
  "landscape",
  "embrace",
  "robust",
  "seamless",
  "holistic",
  "in the realm of",
  "paves the way",
  "plays a vital role",
  "on the other hand",
  "as a result",
  "additionally",
];

export const MIN_WORDS_FOR_STABLE_READ = 25;
export const MIN_WORDS_TO_SCORE = 8;

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"])/)
    .filter((s) => s.trim().length > 0);
}

function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function stdev(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length;
  return Math.sqrt(v);
}

export function analyze(text: string): AnalysisResult {
  const sentences = splitSentences(text);
  const allWords = words(text)
    .map((w) => w.replace(/[^a-zA-Z']/g, "").toLowerCase())
    .filter(Boolean);
  const sentWordCounts = sentences.map((s) => words(s).length);
  const mean =
    sentWordCounts.reduce((a, b) => a + b, 0) / Math.max(sentWordCounts.length, 1);
  const sd = stdev(sentWordCounts);
  const burstiness = mean > 0 ? sd / mean : 0; // lower = more AI-like

  const uniq = new Set(allWords);
  const ttr = allWords.length ? uniq.size / allWords.length : 1; // lower = more AI-like

  const lower = text.toLowerCase();
  let phraseHits = 0;
  const hitPhrases: string[] = [];
  AI_PHRASES.forEach((p) => {
    if (lower.includes(p)) {
      phraseHits++;
      hitPhrases.push(p);
    }
  });
  const phraseDensity = allWords.length ? (phraseHits / allWords.length) * 100 : 0;

  const trigrams: Record<string, number> = {};
  for (let i = 0; i < allWords.length - 2; i++) {
    const g = allWords[i] + " " + allWords[i + 1] + " " + allWords[i + 2];
    trigrams[g] = (trigrams[g] || 0) + 1;
  }
  const repeatedEntries = Object.entries(trigrams)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1]);
  const repeats = repeatedEntries.length;
  const repeatedPhrases: RepeatedPhrase[] = repeatedEntries
    .slice(0, 6)
    .map(([phrase, count]) => ({ phrase, count }));
  const repetitionRate = allWords.length ? repeats / allWords.length : 0;

  const emdash = (text.match(/—/g) || []).length;
  const emdashRate = allWords.length ? (emdash / allWords.length) * 100 : 0;

  const s_burst = burstiness < 0.35 ? 90 : burstiness < 0.55 ? 65 : burstiness < 0.8 ? 35 : 12;
  const s_ttr = ttr < 0.45 ? 85 : ttr < 0.6 ? 55 : ttr < 0.72 ? 30 : 10;
  const s_phrase = Math.min(100, phraseDensity * 140);
  const s_repeat = Math.min(100, repetitionRate * 900);
  const s_emdash = Math.min(100, emdashRate * 35);
  const s_len =
    sentences.length > 1
      ? (() => {
          const lens = sentences.map((s) => s.length);
          const lsd = stdev(lens);
          const lmean = lens.reduce((a, b) => a + b, 0) / lens.length;
          const cv = lmean > 0 ? lsd / lmean : 1;
          return cv < 0.3 ? 80 : cv < 0.5 ? 45 : 15;
        })()
      : 40;

  const score = Math.round(
    s_burst * 0.28 + s_ttr * 0.2 + s_phrase * 0.22 + s_repeat * 0.14 + s_emdash * 0.06 + s_len * 0.1
  );
  const clamped = Math.max(2, Math.min(98, score));

  return {
    score: clamped,
    burstiness,
    ttr,
    phraseHits,
    hitPhrases,
    repeats,
    repeatedPhrases,
    emdash,
    sentenceCount: sentences.length,
    wordCount: allWords.length,
  };
}

export function verdictLabel(score: number): { label: Verdict; className: string } {
  if (score >= 66) return { label: "AI-LIKELY", className: "tag-ai" };
  if (score <= 34) return { label: "HUMAN-LIKELY", className: "tag-human" };
  return { label: "MIXED / UNCLEAR", className: "tag-mixed" };
}

export function burstinessLabel(b: number): string {
  if (b < 0.35) return "Very low — AI-typical";
  if (b < 0.55) return "Low — leans AI-typical";
  if (b < 0.8) return "Moderate — leans human";
  return "High — human-typical";
}

export function vocabLabel(t: number): string {
  if (t < 0.45) return "Very low — AI-typical";
  if (t < 0.6) return "Low — leans AI-typical";
  if (t < 0.72) return "Moderate — leans human";
  return "High — human-typical";
}

export function phraseLabel(n: number): string {
  if (n === 0) return "None found";
  if (n === 1) return "Minor signal";
  if (n <= 3) return "Notable signal";
  return "Heavy signal";
}

export function repeatLabel(n: number): string {
  if (n === 0) return "None — normal";
  if (n <= 3) return "Low — normal range";
  if (n <= 8) return "Elevated";
  return "High";
}

export function improvementTips(r: AnalysisResult): string[] {
  const tips: string[] = [];
  if (r.hitPhrases.length) {
    tips.push(
      `Cut or replace the flagged transitions (${r.hitPhrases
        .slice(0, 3)
        .map((p) => `"${p}"`)
        .join(", ")}) with a more specific connector, or remove the transition and let the sentences flow directly.`
    );
  }
  if (r.burstiness < 0.5) {
    tips.push(
      "Vary your sentence length more — follow a long, detailed sentence with something short. Uniform pacing is the single strongest AI signal here."
    );
  }
  if (r.ttr < 0.6) {
    tips.push(
      "Widen your word choice — you're repeating the same words more than typical. Swap in synonyms or more specific/concrete language where you can."
    );
  }
  if (r.repeats > 0) {
    tips.push(
      `Reword the repeated phrase${r.repeats > 1 ? "s" : ""} (${r.repeatedPhrases
        .slice(0, 2)
        .map((p) => `"${p.phrase}"`)
        .join(", ")}) so the same three words don't reappear verbatim.`
    );
  }
  if (tips.length === 0) {
    tips.push("This passage already reads as human-typical across every signal we check — nothing to change here.");
  }
  return tips;
}
