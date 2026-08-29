import { createHash } from "crypto";
import { supabaseAdmin } from "./supabaseAdmin";
import { limitsFor, type PlanId } from "./pricing";

export interface UsageCheck {
  allowed: boolean;
  wordsUsedToday: number;
  dailyLimit: number;
  plan: PlanId;
  reason?: string;
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

// Anonymous callers (no Supabase session) are still allowed the Free
// tier's daily words, tracked by a salted hash of their IP rather than
// the raw address, so we never store PII for anonymous traffic.
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "litimus-anon";
  return createHash("sha256").update(salt + ip).digest("hex");
}

async function getPlan(userId: string | null): Promise<PlanId> {
  if (!userId) return "free";
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  return (data?.plan as PlanId) || "free";
}

async function getActiveDayPassWords(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const { data } = await supabaseAdmin()
    .from("day_passes")
    .select("words_granted")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString());
  return (data || []).reduce((sum: number, row: { words_granted: number }) => sum + row.words_granted, 0);
}

async function getWordsUsedToday(userId: string | null, ipHash: string | null): Promise<number> {
  const date = todayISODate();
  const query = supabaseAdmin().from("usage_daily").select("words_used").eq("usage_date", date);
  const { data } = userId
    ? await query.eq("user_id", userId).maybeSingle()
    : await query.eq("ip_hash", ipHash!).maybeSingle();
  return (data?.words_used as number) || 0;
}

/**
 * Checks whether `wordCount` more words are allowed today for this caller,
 * WITHOUT recording usage yet. Call recordUsage() only after a successful
 * scan, so a failed/aborted request doesn't burn the caller's quota.
 */
export async function checkUsage(
  userId: string | null,
  ipHash: string | null,
  wordCount: number
): Promise<UsageCheck> {
  const plan = await getPlan(userId);
  const limits = limitsFor(plan);
  const dayPassWords = await getActiveDayPassWords(userId);
  const dailyLimit = limits.dailyWordLimit + dayPassWords;
  const wordsUsedToday = await getWordsUsedToday(userId, ipHash);

  if (wordsUsedToday + wordCount > dailyLimit) {
    return {
      allowed: false,
      wordsUsedToday,
      dailyLimit,
      plan,
      reason: `This would put you over your daily limit of ${dailyLimit} words (${wordsUsedToday} used so far today). Upgrade your plan or buy a day pass for more.`,
    };
  }

  return { allowed: true, wordsUsedToday, dailyLimit, plan };
}

export async function recordUsage(userId: string | null, ipHash: string | null, wordCount: number): Promise<void> {
  const date = todayISODate();
  const admin = supabaseAdmin();

  // Upsert-by-increment: read-then-write is good enough at this scale;
  // a high-traffic future version should switch to a Postgres RPC that
  // does the increment atomically (`words_used = words_used + $1`).
  const existing = userId
    ? await admin.from("usage_daily").select("id, words_used").eq("user_id", userId).eq("usage_date", date).maybeSingle()
    : await admin.from("usage_daily").select("id, words_used").eq("ip_hash", ipHash!).eq("usage_date", date).maybeSingle();

  if (existing.data) {
    await admin
      .from("usage_daily")
      .update({ words_used: (existing.data.words_used as number) + wordCount })
      .eq("id", existing.data.id);
  } else {
    await admin.from("usage_daily").insert({
      user_id: userId,
      ip_hash: userId ? null : ipHash,
      usage_date: date,
      words_used: wordCount,
    });
  }
}

export async function getUsageSnapshot(userId: string): Promise<{ plan: PlanId; wordsUsedToday: number; dailyLimit: number }> {
  const plan = await getPlan(userId);
  const limits = limitsFor(plan);
  const dayPassWords = await getActiveDayPassWords(userId);
  const wordsUsedToday = await getWordsUsedToday(userId, null);
  return { plan, wordsUsedToday, dailyLimit: limits.dailyWordLimit + dayPassWords };
}
