// Single source of truth for the pricing copy shown on the landing page
// and pricing page. The backend has its own copy (backend/lib/pricing.ts)
// that defines the *enforced* limits — keep the numbers in sync between
// the two; this file is presentation-only.

export type TierId = "free" | "student" | "pro" | "team";

export interface Tier {
  id: TierId;
  name: string;
  price: string;
  priceSuffix?: string;
  cycle: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cycle: "forever",
    description: "For the occasional check.",
    features: [
      "2,000 words / day",
      "Plain text & paste only",
      "Full margin-notes report",
      "Score history: 24 hours",
    ],
    cta: "Start free",
  },
  {
    id: "student",
    name: "Student",
    price: "$4",
    priceSuffix: "/mo",
    cycle: "billed monthly · student-verified",
    description: "Full Pro limits at a student rate, wherever you study.",
    features: [
      "25,000 words / day",
      ".docx, .pdf, Google Docs import",
      "Draft-history comparison",
      "Citation-safe export for tutors",
      "Re-verify yearly, any country",
    ],
    cta: "Verify & join",
    badge: "Student",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$15",
    priceSuffix: "/mo",
    cycle: "billed monthly, or $12/mo yearly",
    description: "For writers, editors, and educators.",
    features: [
      "25,000 words / day",
      ".docx, .pdf, Google Docs import",
      "Batch scan up to 20 files",
      "Shareable, brandable reports",
      "Priority support",
    ],
    cta: "Start Pro trial",
    badge: "Most popular",
    featured: true,
  },
  {
    id: "team",
    name: "Team & API",
    price: "$49",
    priceSuffix: "/mo",
    cycle: "from, 5 seats included",
    description: "For schools, publications, and platforms.",
    features: [
      "Unlimited scans, pooled seats",
      "REST API, usage-based overage",
      "LMS & Google Classroom integration",
      "Admin dashboard & audit log",
      "SSO on request",
    ],
    cta: "Talk to us",
  },
];
// Numeric mirror of the Free tier's "2,000 words / day" copy above, kept as
// its own export so the detector can enforce it without parsing feature
// strings. Must match backend/lib/pricing.ts's PLAN_LIMITS.free.dailyWordLimit.
export const FREE_WORD_LIMIT = 2_000;
export const DAY_PASS = {
  price: "$3",
  priceSuffix: "once-off",
  words: 10_000,
  validHours: 24,
  description:
    "A one-time top-up for a single deadline — no subscription, no recurring charge. Adds 10,000 words to your daily limit, valid for 24 hours, stacks on top of any plan including Free.",
};
