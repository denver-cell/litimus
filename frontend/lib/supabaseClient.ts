"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Uses the public anon key only — all
// privileged operations (usage limiting, plan changes, PayFast webhooks)
// happen server-side in the litmus-backend app, never here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
