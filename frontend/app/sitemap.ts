import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Public, indexable pages only. When a new public page is added (guide,
// comparison page, use-case page), add its path here.
// No lastModified on purpose: a build-time "now" would claim every page
// changed on every deploy, and search engines learn to ignore that.
const PATHS = [
  "/",
  "/pricing",
  "/docs/api",
  "/compare",
  "/compare/gptzero",
  "/compare/turnitin",
  "/compare/originality-ai",
  "/for/teachers",
  "/for/students",
  "/for/writers-and-editors",
  "/guides",
  "/guides/how-ai-detectors-work",
  "/guides/ai-detector-false-positives",
  "/guides/falsely-accused-of-ai-writing",
  "/privacy",
  "/terms",
  "/refund-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
