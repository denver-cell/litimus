import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";

export interface AuthedUser {
  id: string;
  email: string | null;
}

// Resolves the caller's identity from a Supabase-issued bearer token, or
// null for anonymous requests. Anonymous requests still get served (the
// Free plan's daily limit), tracked by a hashed IP instead of a user id —
// see usageLimiter.ts.
export async function getAuthedUser(req: NextRequest): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}
