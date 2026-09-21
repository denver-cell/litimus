// Shared constants for the long-form pages (/compare, /for, /guides).

/** Date the content pages were last reviewed against their sources (ISO). Bump when the copy is re-checked. */
export const CONTENT_UPDATED = "2026-09-20";
export const CONTENT_PUBLISHED = "2026-09-20";

// Homepage FAQ. Lives here (not in components/Faq.tsx) because that
// component is "use client" — a server component like app/page.tsx can't
// call .map() on a value re-exported from a client module.
export const FAQ_ITEMS = [
  {
    q: "Can Litimus tell me for certain that something was written by AI?",
    a: "No — and no detector on the market can, honestly. Litimus gives you a probability based on writing patterns, plus the exact reasons behind the number, so you can weigh it yourself rather than take a black-box verdict.",
  },
  {
    q: "How is the student plan verified?",
    a: "Through a third-party student-verification service (the kind Spotify and Amazon use for student pricing) rather than a bare .edu check — it recognizes academic domains and enrollment records across most countries, not just the US, and falls back to a student-ID upload if your institution doesn't use a standard email pattern. We re-verify once a year.",
  },
  {
    q: "Do you store the text I scan?",
    a: "Free and Student scans are processed in-session and discarded. Pro and Team plans can opt into saved report history for their own records — off by default.",
  },
  {
    q: "Does heavy editing of AI output fool the detector?",
    a: "Often, yes, to a degree — this is a known limit of statistical detection industry-wide, which is why we show a confidence range and margin notes instead of a bare pass/fail stamp.",
  },
  {
    q: "What if I just need more words for one deadline?",
    a: "Buy a one-time day pass ($5) instead of upgrading your plan — it adds 10,000 words to your limit for 24 hours, works on top of Free or any paid tier, and doesn't auto-renew or commit you to anything ongoing.",
  },
  {
    q: "Is there an API?",
    a: "Yes, on the Team & API plan — REST endpoints for scanning, batch jobs, and webhook callbacks, billed on included volume plus metered overage.",
  },
];

export interface Source {
  label: string;
  href: string;
  note?: string;
}

// External sources, defined once so every page cites the same URL and label.
export const SRC = {
  turnitinGuide: {
    label: "Turnitin Guides: Using the AI Writing Report",
    href: "https://guides.turnitin.com/hc/en-us/articles/22774058814093-Using-the-AI-Writing-Report",
  },
  turnitinFalsePositives: {
    label: "Turnitin: Understanding false positives within our AI writing detection capabilities",
    href: "https://www.turnitin.com/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities",
  },
  gptzeroHome: { label: "GPTZero", href: "https://gptzero.me/" },
  gptzeroPricing: { label: "GPTZero pricing", href: "https://gptzero.me/pricing" },
  originalityPricing: { label: "Originality.ai pricing", href: "https://originality.ai/pricing" },
  liang: {
    label: "Liang et al., “GPT detectors are biased against non-native English writers” (Patterns, 2023)",
    href: "https://arxiv.org/abs/2304.02819",
  },
  openai: {
    label: "OpenAI: New AI classifier for indicating AI-written text (with the July 2023 discontinuation notice)",
    href: "https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/",
  },
} satisfies Record<string, Source>;
