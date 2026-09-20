import { redirect } from "next/navigation";

// Account creation now happens inside the checkout flow (/checkout): pick a
// plan, enter details, agree to the Terms, and the account is created from
// that. This route stays so old links, bookmarks and search results keep
// working — it just forwards (keeping ?plan=) instead of showing a bare
// "create an account" form that asked for credentials before a plan.
export default function SignupPage({ searchParams }: { searchParams: { plan?: string | string[] } }) {
  const plan = Array.isArray(searchParams.plan) ? searchParams.plan[0] : searchParams.plan;
  redirect(plan ? `/checkout?plan=${encodeURIComponent(plan)}` : "/checkout");
}
