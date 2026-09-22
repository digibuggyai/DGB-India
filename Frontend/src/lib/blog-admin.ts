import "server-only";
import { revalidatePath } from "next/cache";
import { postPath, type AdminAuthor, type AdminPost, type PostType } from "./blog-types";

/* Server-side access to posts for the admin Blog tab. Every call carries the
 * signed-in admin's own CMS token, so the CMS enforces who may write, and
 * drafts and scheduled posts come back too. */

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export class BlogError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function cms<T>(path: string, token: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    method,
    headers: { Authorization: `JWT ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const data = (await res.json().catch(() => ({}))) as {
    errors?: { message?: string; data?: { errors?: { message?: string; path?: string }[] } }[];
  };
  if (!res.ok) {
    const field = data.errors?.[0]?.data?.errors?.[0];
    const message = field?.message ? `${field.path ?? "Field"}: ${field.message}` : data.errors?.[0]?.message;
    throw new BlogError(message || `The CMS returned an error (${res.status}).`, res.status);
  }
  return data as T;
}

type RawPost = {
  id: number;
  title: string;
  slug?: string | null;
  type?: PostType;
  excerpt?: string | null;
  bodyMarkdown?: string | null;
  tags?: { tag: string }[] | null;
  author?: { id: number; name: string } | number | null;
  publishedAt?: string | null;
  updatedAt: string;
  readingMinutes?: number | null;
};

function toAdminPost(p: RawPost): AdminPost {
  const author = p.author && typeof p.author === "object" ? p.author : null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug ?? "",
    type: p.type === "insight" ? "insight" : "blog",
    excerpt: p.excerpt ?? "",
    bodyMarkdown: p.bodyMarkdown ?? "",
    tags: (p.tags ?? []).map((t) => t.tag).filter(Boolean),
    authorId: author?.id ?? (typeof p.author === "number" ? p.author : null),
    authorName: author?.name ?? null,
    publishedAt: p.publishedAt ?? null,
    updatedAt: p.updatedAt,
    readingMinutes: p.readingMinutes ?? null,
  };
}

export async function listPosts(token: string): Promise<AdminPost[]> {
  const res = await cms<{ docs: RawPost[] }>("/posts?limit=200&depth=1&sort=-updatedAt", token);
  return res.docs.map(toAdminPost);
}

export async function listAuthors(token: string): Promise<AdminAuthor[]> {
  const res = await cms<{ docs: { id: number; name: string }[] }>("/authors?limit=100&depth=0&sort=name", token);
  return res.docs.map((a) => ({ id: a.id, name: a.name }));
}

/** Only the fields the editor manages, each coerced to what the CMS expects. */
export function sanitizePost(input: unknown): Record<string, unknown> {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const text = (v: unknown) => String(v ?? "").trim();

  if ("title" in src) out.title = text(src.title);
  if ("type" in src) out.type = src.type === "insight" ? "insight" : "blog";
  if ("slug" in src && text(src.slug)) out.slug = text(src.slug);
  if ("excerpt" in src) out.excerpt = text(src.excerpt);
  if ("bodyMarkdown" in src) out.bodyMarkdown = String(src.bodyMarkdown ?? "");
  if ("tags" in src && Array.isArray(src.tags)) {
    out.tags = [...new Set(src.tags.map(text).filter(Boolean))].slice(0, 12).map((tag) => ({ tag }));
  }
  if ("authorId" in src) {
    const id = Number(src.authorId);
    out.author = Number.isInteger(id) && id > 0 ? id : null;
  }
  if ("publishedAt" in src) {
    const d = src.publishedAt ? new Date(String(src.publishedAt)) : null;
    out.publishedAt = d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
  }
  return out;
}

export async function createPost(token: string, data: Record<string, unknown>): Promise<AdminPost> {
  const res = await cms<{ doc: RawPost }>("/posts?depth=1", token, "POST", data);
  return toAdminPost(res.doc);
}

export async function updatePost(token: string, id: number, data: Record<string, unknown>): Promise<AdminPost> {
  const res = await cms<{ doc: RawPost }>(`/posts/${id}?depth=1`, token, "PATCH", data);
  return toAdminPost(res.doc);
}

export async function deletePost(token: string, id: number): Promise<void> {
  await cms(`/posts/${id}`, token, "DELETE");
}

/** The listings, the resources hub, the sitemap and the post itself show a
 *  change straight away rather than after the page cache runs out. */
export function revalidateBlog(post?: { type: PostType; slug: string }) {
  for (const path of ["/resources", "/resources/blog", "/resources/insights", "/sitemap.xml"]) revalidatePath(path);
  if (post?.slug) revalidatePath(postPath(post));
}
