import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getPublishedArticles, PILLARS } from "@/lib/articles";

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
  // Pre-written articles under content/articles/ — only ones whose
  // publishAt has passed are included, so scheduled-but-unpublished
  // articles stay out of the sitemap until their date arrives.
  const articlePaths = PILLARS.flatMap((pillar) =>
    getPublishedArticles(pillar).map((a) => `/for/${pillar}/${a.slug}`),
  );
  return [...PATHS, ...articlePaths].map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
