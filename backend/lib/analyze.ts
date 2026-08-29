// Server-side copy of the Litimus heuristic detection engine.
//
// This is intentionally the same logic as frontend/lib/analyze.ts — the
// frontend runs it client-side for instant, free, unauthenticated scans;
// this copy runs here so that authenticated/paid scans (which count
// against a metered daily word limit, and eventually feed a saved report
// history) are computed and billed server-side, where they can't be
// tampered with from the browser.
//
// Longer-term this becomes a real detection engine (perplexity-based
// scoring against a small local language model, then a trained
// classifier) — see the roadmap note in README.md. For now both copies
// share the same heuristic scoring so free and paid users see consistent
// numbers.
//
// Keep this file in sync with frontend/lib/analyze.ts.

export interface RepeatedPhrase {
  phrase: string;
  count: number;
}

export interface AnalysisResult {
  score: number;
  burstiness: number;
  ttr: number;
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
export const MAX_WORDS_PER_REQUEST = 30_000;

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
  const burstiness = mean > 0 ? sd / mean : 0;

  const uniq = new Set(allWords);
  const ttr = allWords.length ? uniq.size / allWords.length : 1;

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

export function verdictLabel(score: number): Verdict {
  if (score >= 66) return "AI-LIKELY";
  if (score <= 34) return "HUMAN-LIKELY";
  return "MIXED / UNCLEAR";
}
