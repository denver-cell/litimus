import Link from "next/link";
import { FREE_WORD_LIMIT } from "@/lib/pricing";

// Closing call to action for the long-form pages. Points at the on-page
// detector on the homepage and at the pricing page.
export default function ScanCta({ title, text }: { title?: string; text?: string }) {
  return (
    <aside className="scan-cta">
      <h2>{title ?? "Try it on your own text"}</h2>
      <p>
        {text ??
          `Paste a passage and get a scored report with the reasons shown. Free scans cover ${FREE_WORD_LIMIT.toLocaleString(
            "en-US"
          )} words a day, need no account, and run in your browser.`}
      </p>
      <Link href="/#detector" className="btn">
        Run a free scan
      </Link>
      <Link href="/pricing" className="btn btn-ghost">
        See plans
      </Link>
    </aside>
  );
}
