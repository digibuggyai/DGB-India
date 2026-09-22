import "server-only";
import { revalidatePath } from "next/cache";
import { postPath, type AdminAuthor, type AdminImage, type AdminPost, type PostType } from "./blog-types";

/* Server-side access to posts and their images for the admin Blog tab. Every
 * call carries the signed-in admin's own CMS token, so the CMS enforces who may
 * write, and drafts and scheduled posts come back too. */

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export class BlogError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type CmsErrors = { errors?: { message?: string; data?: { errors?: { message?: string; path?: string }[] } }[] };

async function cms<T>(path: string, token: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `JWT ${token}` };
  if (init.json !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API}/api${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
    cache: "no-store",
    signal: AbortSignal.timeout(60000),
  });
  const data = (await res.json().catch(() => ({}))) as CmsErrors;
  if (!res.ok) {
    const field = data.errors?.[0]?.data?.errors?.[0];
    const message = field?.message ? `${field.path ?? "Field"}: ${field.message}` : data.errors?.[0]?.message;
    throw new BlogError(message || `The CMS returned an error (${res.status}).`, res.status);
  }
  return data as T;
}

type RawMedia = {
  id: number;
  url?: string | null;
  alt?: string | null;
  sizes?: Record<string, { url?: string | null } | undefined> | null;
};

function toImage(m: RawMedia | number | null | undefined): AdminImage | null {
  if (!m || typeof m !== "object" || !m.url) return null;
  return { id: m.id, url: m.sizes?.card?.url || m.url, alt: m.alt ?? "" };
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
  coverImage?: RawMedia | number | null;
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
    cover: toImage(p.coverImage),
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
  const id = (v: unknown) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  };

  if ("title" in src) out.title = text(src.title);
  if ("type" in src) out.type = src.type === "insight" ? "insight" : "blog";
  if ("slug" in src && text(src.slug)) out.slug = text(src.slug);
  if ("excerpt" in src) out.excerpt = text(src.excerpt);
  if ("bodyMarkdown" in src) out.bodyMarkdown = String(src.bodyMarkdown ?? "");
  if ("tags" in src && Array.isArray(src.tags)) {
    out.tags = [...new Set(src.tags.map(text).filter(Boolean))].slice(0, 12).map((tag) => ({ tag }));
  }
  if ("authorId" in src) out.author = id(src.authorId);
  if ("coverId" in src) out.coverImage = id(src.coverId);
  if ("publishedAt" in src) {
    const d = src.publishedAt ? new Date(String(src.publishedAt)) : null;
    out.publishedAt = d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
  }
  return out;
}

export async function createPost(token: string, data: Record<string, unknown>): Promise<AdminPost> {
  const res = await cms<{ doc: RawPost }>("/posts?depth=1", token, { method: "POST", json: data });
  return toAdminPost(res.doc);
}

export async function updatePost(token: string, id: number, data: Record<string, unknown>): Promise<AdminPost> {
  const res = await cms<{ doc: RawPost }>(`/posts/${id}?depth=1`, token, { method: "PATCH", json: data });
  return toAdminPost(res.doc);
}

export async function deletePost(token: string, id: number): Promise<void> {
  await cms(`/posts/${id}`, token, { method: "DELETE" });
}

/* ---------------- images ---------------- */

/** Stores an image in the CMS's media library. The CMS makes the preview,
 *  card and banner sizes itself. */
export async function uploadImage(token: string, file: File, alt: string): Promise<AdminImage> {
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("_payload", JSON.stringify({ alt }));
  const res = await cms<{ doc: RawMedia }>("/media", token, { method: "POST", form });
  const image = toImage(res.doc);
  if (!image) throw new BlogError("The image was stored but the CMS returned no address for it.", 502);
  return image;
}

export async function listImages(token: string, ids: number[]): Promise<AdminImage[]> {
  if (!ids.length) return [];
  const res = await cms<{ docs: RawMedia[] }>(`/media?limit=${ids.length}&depth=0&where[id][in]=${ids.join(",")}`, token);
  return res.docs.map(toImage).filter((i): i is AdminImage => i !== null);
}

export async function updateImageAlt(token: string, id: number, alt: string): Promise<AdminImage> {
  const res = await cms<{ doc: RawMedia }>(`/media/${id}`, token, { method: "PATCH", json: { alt } });
  const image = toImage(res.doc);
  if (!image) throw new BlogError("The image couldn't be found.", 404);
  return image;
}

/** The listings, the resources hub, the sitemap and the post itself show a
 *  change straight away rather than after the page cache runs out. */
export function revalidateBlog(post?: { type: PostType; slug: string }) {
  for (const path of ["/resources", "/resources/blog", "/resources/insights", "/sitemap.xml"]) revalidatePath(path);
  if (post?.slug) revalidatePath(postPath(post));
}
