/* Shapes shared by the admin Blog tab and its API routes. */

export type PostType = "blog" | "insight";

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
