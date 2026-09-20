// Shared constants for the long-form pages (/compare, /for, /guides).

/** Date the content pages were last reviewed against their sources (ISO). Bump when the copy is re-checked. */
export const CONTENT_UPDATED = "2026-09-20";
export const CONTENT_PUBLISHED = "2026-09-20";

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
