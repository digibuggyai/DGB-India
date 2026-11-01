import type { Faq } from "./blog-schema";

export type { Faq };

export type PostType = "blog" | "insight";

export type AdminImage = {
  id: number;
  url: string;
  alt: string;
};

export type AdminPost = {
  id: number;
  title: string;
  slug: string;
  type: PostType;
  excerpt: string;
  bodyMarkdown: string;
  tags: string[];
  authorId: number | null;
  authorName: string | null;
  cover: AdminImage | null;
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number | null;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  faqs: Faq[];
  schemaJson: string;
};

export type AdminAuthor = { id: number; name: string };

export type PostStatus = "draft" | "scheduled" | "published";

export function postStatus(publishedAt: string | null, now = Date.now()): PostStatus {
  if (!publishedAt) return "draft";
  return new Date(publishedAt).getTime() > now ? "scheduled" : "published";
}

export function postPath(post: { type: PostType; slug: string }): string {
  return `/resources/${post.type === "insight" ? "insights" : "blog"}/${post.slug}`;
}

export const imageToken = (id: number) => `![media:${id}]()`;

export function imageIdsIn(markdown: string): number[] {
  return [...new Set([...markdown.matchAll(/!\[media:(\d+)\]\(\)/g)].map((m) => Number(m[1])))];
}

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
