import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/resources/PostDetail";
import { coverOf } from "@/components/resources/postMeta";
import { getPosts, getPostBySlug } from "@/lib/content";

// Built ahead of time where possible; a CMS outage at build time shouldn't fail
// the whole deploy — the pages then render on first visit instead.
export async function generateStaticParams() {
  const posts = await getPosts("blog", 100).catch(() => []);
  return posts.map((p) => ({ slug: p.slug ?? "" }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      // The banner doubles as the preview image when the post is shared.
      images: coverOf(post, "hero") ? [{ url: coverOf(post, "hero")!.url, alt: coverOf(post, "hero")!.alt }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.type !== "blog") notFound();

  const related = (await getPosts("blog", 4).catch(() => [])).filter((p) => p.id !== post.id).slice(0, 3);
  return <PostDetail post={post} kicker="Blog" basePath="/resources/blog" related={related} />;
}
