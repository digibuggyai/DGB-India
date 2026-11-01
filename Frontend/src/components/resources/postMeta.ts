import type { Media, Post } from "@/payload-types";

export function postDate(post: Post): string | null {
  if (!post.publishedAt) return null;
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(post.publishedAt),
  );
}

export function readingLabel(post: Post): string | null {
  return post.readingMinutes ? `${post.readingMinutes} min read` : null;
}

export function postTags(post: Post): string[] {
  return (post.tags ?? []).map((t) => t.tag).filter(Boolean);
}

export function keywordsFor(post: Post): string[] {
  const typed = (post.seo?.keywords ?? "").split(",").map((k) => k.trim());
  return [...new Set([...postTags(post), ...typed])].filter(Boolean);
}

export function coverOf(post: Post, size: "card" | "hero" = "card"): { url: string; alt: string } | null {
  const media = post.coverImage && typeof post.coverImage === "object" ? (post.coverImage as Media) : null;
  const url = media?.sizes?.[size]?.url || media?.url;
  return url ? { url, alt: media?.alt || post.title } : null;
}

export function authorOf(post: Post): { name: string; role: string | null } | null {
  const author = post.author && typeof post.author === "object" ? post.author : null;
  return author?.name ? { name: author.name, role: author.role ?? null } : null;
}
