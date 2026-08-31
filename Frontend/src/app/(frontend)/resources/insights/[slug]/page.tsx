import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/resources/PostDetail";
import { getPosts, getPostBySlug } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getPosts("insight", 100);
  return posts.map((p) => ({ slug: p.slug ?? "" }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.type !== "insight") notFound();
  return <PostDetail post={post} kicker="Insight" />;
}
