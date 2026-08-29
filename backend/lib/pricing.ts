// Enforced pricing tiers. This is the source of truth the usage limiter
// and detect API check against — keep in sync with the presentation copy
// in frontend/lib/pricing.ts, but this file is what actually gates access.

export type PlanId = "free" | "student" | "pro" | "team";

export interface PlanLimits {
  id: PlanId;
  dailyWordLimit: number;
  allowFileUpload: boolean; // .docx / .pdf / Google Docs import
  allowBatchScan: boolean;
  allowApi: boolean;
  allowSavedHistory: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    dailyWordLimit: 2_000,
    allowFileUpload: false,
    allowBatchScan: false,
    allowApi: false,
    allowSavedHistory: false,
  },
  student: {
    id: "student",
    dailyWordLimit: 25_000,
    allowFileUpload: true,
    allowBatchScan: false,
    allowApi: false,
    allowSavedHistory: false,
  },
  pro: {
    id: "pro",
    dailyWordLimit: 25_000,
    allowFileUpload: true,
    allowBatchScan: true,
    allowApi: false,
    allowSavedHistory: true,
  },
  team: {
    id: "team",
    // "Unlimited, pooled seats" in marketing copy — enforced here as a
    // generous ceiling per seat so a single compromised key can't run the
    // metered overage bill up unboundedly.
    dailyWordLimit: 250_000,
    allowFileUpload: true,
    allowBatchScan: true,
    allowApi: true,
    allowSavedHistory: true,
  },
};

export const DAY_PASS_WORDS = 10_000;
export const DAY_PASS_VALID_HOURS = 24;

export function limitsFor(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[(plan as PlanId) || "free"] || PLAN_LIMITS.free;
}
