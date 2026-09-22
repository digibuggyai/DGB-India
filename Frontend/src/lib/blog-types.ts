/* Shapes shared by the admin Blog tab and its API routes. */

export type PostType = "blog" | "insight";

export type AdminImage = {
  id: number;
  /** A size suited to previews; the original is used when no smaller size exists. */
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
};

export type AdminAuthor = { id: number; name: string };

export type PostStatus = "draft" | "scheduled" | "published";

/** Published means the publish date has arrived — the same rule the CMS uses
 *  to decide what the public can see. */
export function postStatus(publishedAt: string | null, now = Date.now()): PostStatus {
  if (!publishedAt) return "draft";
  return new Date(publishedAt).getTime() > now ? "scheduled" : "published";
}

export function postPath(post: { type: PostType; slug: string }): string {
  return `/resources/${post.type === "insight" ? "insights" : "blog"}/${post.slug}`;
}

/** How an uploaded image is written into an article. The CMS reads this as a
 *  real image block and writes it back the same way, so it survives edits made
 *  in either the site's Blog tab or the CMS itself. */
export const imageToken = (id: number) => `![media:${id}]()`;

export function imageIdsIn(markdown: string): number[] {
  return [...new Set([...markdown.matchAll(/!\[media:(\d+)\]\(\)/g)].map((m) => Number(m[1])))];
}

/** Banners and article images: what the upload accepts. The size cap is the
 *  host's request limit — Vercel refuses bodies over about 4.5 MB. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
