// Pre-written MDX articles under content/articles/<pillar>/<slug>.mdx.
// Visibility is gated by frontmatter `publishAt`, re-checked on every ISR
// revalidation (see app/for/[pillar]/[slug]/page.tsx) — publishing an
// article that's already committed to the repo is just its date passing,
// no redeploy or scheduled job required.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { SRC, type Source } from "@/lib/content";

export const PILLARS = ["teachers", "students", "writers-and-editors"] as const;
export type Pillar = (typeof PILLARS)[number];

export function isPillar(value: string): value is Pillar {
  return (PILLARS as readonly string[]).includes(value);
}

export const PILLAR_EYEBROW: Record<Pillar, string> = {
  teachers: "For teachers",
  students: "For students",
  "writers-and-editors": "For writers and editors",
};

export const PILLAR_CRUMB: Record<Pillar, { name: string; path: string }> = {
  teachers: { name: "For teachers", path: "/for/teachers" },
  students: { name: "For students", path: "/for/students" },
  "writers-and-editors": { name: "For writers and editors", path: "/for/writers-and-editors" },
};

const relatedLinkSchema = z.object({
  href: z.string(),
  title: z.string(),
  blurb: z.string(),
});

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  eyebrow: z.string().optional(),
  lede: z.string(),
  /** ISO date ("2026-09-23") the article becomes visible. This is the entire scheduler. */
  publishAt: z.string(),
  updated: z.string().optional(),
  related: z.array(relatedLinkSchema).optional(),
  /** Keys into lib/content.ts's SRC, resolved to full Source objects below. */
  sources: z.array(z.string()).optional(),
});

export interface ArticleMeta {
  pillar: Pillar;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  publishAt: string;
  updated: string;
  related?: { href: string; title: string; blurb: string }[];
  sources?: Source[];
}

export interface Article extends ArticleMeta {
  /** Raw MDX body, not yet compiled — pass to <MDXRemote source={body} />. */
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "articles");

function articleDir(pillar: Pillar): string {
  return path.join(CONTENT_ROOT, pillar);
}

function readSlugs(pillar: Pillar): string[] {
  const dir = articleDir(pillar);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function resolveSources(keys: string[] | undefined, pillar: Pillar, slug: string): Source[] | undefined {
  if (!keys || keys.length === 0) return undefined;
  return keys.map((key) => {
    const source = (SRC as Record<string, Source>)[key];
    if (!source) {
      throw new Error(
        `content/articles/${pillar}/${slug}.mdx references unknown source key "${key}" — check lib/content.ts's SRC.`,
      );
    }
    return source;
  });
}

function readArticle(pillar: Pillar, slug: string): Article | null {
  const file = path.join(articleDir(pillar), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter in content/articles/${pillar}/${slug}.mdx: ${parsed.error.message}`);
  }
  const fm = parsed.data;
  return {
    pillar,
    slug,
    title: fm.title,
    description: fm.description,
    eyebrow: fm.eyebrow ?? PILLAR_EYEBROW[pillar],
    lede: fm.lede,
    publishAt: fm.publishAt,
    updated: fm.updated ?? fm.publishAt,
    related: fm.related,
    sources: resolveSources(fm.sources, pillar, slug),
    body: content,
  };
}

function isPublished(publishAt: string, now: Date): boolean {
  return new Date(`${publishAt}T00:00:00Z`) <= now;
}

/** Published articles in a pillar (publishAt has passed), newest first. */
export function getPublishedArticles(pillar: Pillar, opts: { limit?: number } = {}): ArticleMeta[] {
  const now = new Date();
  const articles = readSlugs(pillar)
    .map((slug) => readArticle(pillar, slug))
    .filter((a): a is Article => a !== null && isPublished(a.publishAt, now))
    .sort((a, b) => (a.publishAt < b.publishAt ? 1 : -1));
  return opts.limit ? articles.slice(0, opts.limit) : articles;
}

/** A single article, gated by publishAt — null if missing or not yet due. */
export function getArticle(pillar: Pillar, slug: string): Article | null {
  const article = readArticle(pillar, slug);
  if (!article || !isPublished(article.publishAt, new Date())) return null;
  return article;
}

/** Every currently-published slug across every pillar, for generateStaticParams. */
export function getAllPublishedParams(): { pillar: Pillar; slug: string }[] {
  return PILLARS.flatMap((pillar) => getPublishedArticles(pillar).map((a) => ({ pillar, slug: a.slug })));
}
