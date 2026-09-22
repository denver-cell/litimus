import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Article from "@/components/Article";
import Sources from "@/components/Sources";
import Callout from "@/components/Callout";
import { getAllPublishedParams, getArticle, isPillar, PILLAR_CRUMB } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";

// Re-checks publishAt on every revalidation — this is the whole "auto-publish"
// mechanism. A pre-written article already committed to the repo goes live on
// its own within this window, no redeploy needed.
export const revalidate = 3600;
export const dynamicParams = true;

const mdxComponents = { Callout };

interface Params {
  pillar: string;
  slug: string;
}

export function generateStaticParams() {
  return getAllPublishedParams();
}

export function generateMetadata({ params }: { params: Params }) {
  if (!isPillar(params.pillar)) return {};
  const article = getArticle(params.pillar, params.slug);
  if (!article) return {};
  return pageMetadata({
    title: `${article.title} — Litimus`,
    description: article.description,
    path: `/for/${params.pillar}/${params.slug}`,
  });
}

export default function ArticlePage({ params }: { params: Params }) {
  if (!isPillar(params.pillar)) notFound();
  const article = getArticle(params.pillar, params.slug);
  if (!article) notFound();

  const path = `/for/${params.pillar}/${params.slug}`;

  return (
    <Article
      eyebrow={article.eyebrow}
      title={article.title}
      lede={article.lede}
      description={article.description}
      path={path}
      crumbs={[PILLAR_CRUMB[params.pillar], { name: article.title, path }]}
      updated={article.updated}
      published={article.publishAt}
      isArticle
      related={article.related}
    >
      <MDXRemote source={article.body} components={mdxComponents} />
      {article.sources && article.sources.length > 0 && <Sources items={article.sources} />}
    </Article>
  );
}
