import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/resources/PostDetail";
import { coverOf, keywordsFor } from "@/components/resources/postMeta";
import { getPosts, getPostBySlug } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getPosts("insight", 100).catch(() => []);
  return posts.map((p) => ({ slug: p.slug ?? "" }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
    keywords: keywordsFor(post),
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: coverOf(post, "hero") ? [{ url: coverOf(post, "hero")!.url, alt: coverOf(post, "hero")!.alt }] : undefined,
    },
  };
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.type !== "insight") notFound();

  const related = (await getPosts("insight", 4).catch(() => [])).filter((p) => p.id !== post.id).slice(0, 3);
  return <PostDetail post={post} kicker="Insight" basePath="/resources/insights" related={related} />;
}
