import type { Media, Post } from "@/payload-types";

/* Small readers for a post's metadata, shared by the cards and the article
 * page so the two always describe a post the same way. */

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

/** The cover image, when one was uploaded and resolved (depth ≥ 1). */
export function coverOf(post: Post): { url: string; alt: string } | null {
  const media = post.coverImage && typeof post.coverImage === "object" ? (post.coverImage as Media) : null;
  const url = media?.sizes?.card?.url || media?.url;
  return url ? { url, alt: media?.alt || post.title } : null;
}

export function authorOf(post: Post): { name: string; role: string | null } | null {
  const author = post.author && typeof post.author === "object" ? post.author : null;
  return author?.name ? { name: author.name, role: author.role ?? null } : null;
}
