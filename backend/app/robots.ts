import type { MetadataRoute } from "next";

// api.litimus.app is an API, not a website. Nothing here should ever appear
// in search results.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
