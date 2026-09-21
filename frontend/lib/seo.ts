// Single source of truth for site-wide SEO values. Every page builds its
// <head> metadata through pageMetadata() so title, description, canonical,
// Open Graph and Twitter tags can never drift apart.
//
// NOTE: Next.js merges metadata *shallowly* — a page that defines its own
// `openGraph` replaces the layout's whole `openGraph` object (including the
// image). That is why pages go through this helper instead of writing
// partial openGraph objects by hand.

import type { Metadata } from "next";
import { TIERS } from "@/lib/pricing";

export const SITE_URL = "https://litimus.app";
export const SITE_NAME = "Litimus";
export const LEGAL_NAME = "Forsta Group (Pty) Ltd";
export const SUPPORT_EMAIL = "support@litimus.app";

export const HOME_TITLE = "Litimus — AI Text Detection";
export const HOME_DESCRIPTION =
  "Litimus scores rhythm, phrasing, and repetition the way an editor reads a manuscript — then shows its work sentence by sentence.";

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Litimus — AI text detection that shows its work, sentence by sentence",
};

interface PageMetaInput {
  title: string;
  description: string;
  /** Path of the page, starting with "/". Becomes the canonical URL. */
  path: string;
  /** Keep the page out of search results (still followable). */
  noindex?: boolean;
}

export function pageMetadata({ title, description, path, noindex }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

// ---- JSON-LD ---------------------------------------------------------------

/** Site-wide entities: who runs the site, and what the site is. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      legalName: LEGAL_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: HOME_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

// "$15" -> "15". Derived from lib/pricing.ts so structured-data prices can't
// drift from what the pricing page shows.
function numericPrice(price: string): string {
  return price.replace(/[^0-9.]/g, "") || "0";
}

/** The product itself. Rendered on the homepage only. */
export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#app`,
  name: SITE_NAME,
  url: SITE_URL,
  description: HOME_DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (web browser)",
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: TIERS.map((t) => ({
    "@type": "Offer",
    name: t.name,
    price: numericPrice(t.price),
    priceCurrency: "USD",
    url: `${SITE_URL}/pricing`,
  })),
};

/** Breadcrumb trail. `items` runs from the section root down to the current page, Home excluded. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: new URL(it.path, SITE_URL).toString(),
    })),
  };
}

/** FAQPage markup. Rendered on the homepage only, from the same Q&A shown in components/Faq.tsx. */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Article markup for guides and comparison pages. Authored by the organization, not a named person. */
export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  published: string; // ISO date, e.g. "2026-09-20"
  modified: string; // ISO date
}) {
  const url = new URL(input.path, SITE_URL).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: input.published,
    dateModified: input.modified,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: new URL(OG_IMAGE.url, SITE_URL).toString(),
  };
}
