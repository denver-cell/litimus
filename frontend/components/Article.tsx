import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ScanCta from "@/components/ScanCta";
import { CONTENT_PUBLISHED } from "@/lib/content";
import { articleSchema, breadcrumbSchema } from "@/lib/seo";

export interface Crumb {
  name: string;
  path: string;
}
export interface RelatedLink {
  href: string;
  title: string;
  blurb: string;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Page shell for /compare, /for and /guides: nav, breadcrumbs, title block,
// body, closing scan CTA, related links, footer, and JSON-LD.
export default function Article({
  eyebrow,
  title,
  lede,
  description,
  path,
  crumbs,
  updated,
  published,
  isArticle = false,
  related,
  cta = true,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  description: string;
  path: string;
  /** Trail from the section root down to this page, Home excluded. The last item is this page. */
  crumbs: Crumb[];
  /** ISO date the page was last reviewed. */
  updated: string;
  /** ISO date first published. Defaults to the site-wide CONTENT_PUBLISHED for hand-written pages; pre-written articles pass their own. */
  published?: string;
  isArticle?: boolean;
  related?: RelatedLink[];
  cta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {isArticle && (
        <JsonLd
          data={articleSchema({ title, description, path, published: published ?? CONTENT_PUBLISHED, modified: updated })}
        />
      )}
      <Nav />
      <section style={{ paddingTop: 56, paddingBottom: 64 }}>
        <article className="wrap prose" style={{ maxWidth: 760 }}>
          <div className="crumbs" role="navigation" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={c.path}>
                  <span aria-hidden="true">/ </span>
                  {last ? <span aria-current="page">{c.name}</span> : <Link href={c.path}>{c.name}</Link>}
                </span>
              );
            })}
          </div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
          <p className="meta">Last reviewed {formatDate(updated)}</p>

          {children}

          {cta && <ScanCta />}

          {related && related.length > 0 && (
            <>
              <h2>Keep reading</h2>
              <div className="card-grid">
                {related.map((r) => (
                  <Link key={r.href} href={r.href} className="card-link">
                    <b>{r.title}</b>
                    <span>{r.blurb}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </article>
      </section>
      <Footer />
    </>
  );
}
