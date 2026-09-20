import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Pages with nothing worth indexing. /login and /signup are deliberately NOT
// listed here: they carry a noindex meta tag, and a crawler can only see that
// tag if robots.txt lets it fetch the page.
const DISALLOW = ["/dashboard"];

// AI search / assistant crawlers, named explicitly so the intent to be
// discoverable by them is on record. A bot with its own group ignores the
// "*" group, so the same disallow list is repeated.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
