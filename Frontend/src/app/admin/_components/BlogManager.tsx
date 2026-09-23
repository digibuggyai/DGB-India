"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Toast, type ToastKind } from "@/components/ui/Toast";
import {
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  imageIdsIn,
  imageToken,
  postPath,
  postStatus,
  type AdminAuthor,
  type AdminImage,
  type AdminPost,
  type PostStatus,
  type PostType,
} from "@/lib/blog-types";

/* The admin Blog tab: every post, draft and scheduled post, and an editor that
 * writes in Markdown. The CMS converts it to its own rich text on save, so a
 * post written here can still be edited in the CMS, and the other way round. */

const STATUS_STYLE: Record<PostStatus, { label: string; className: string }> = {
  published: { label: "Published", className: "border-[#cbe7d3] bg-[#e6f4ea] text-[#1e4d2b]" },
  scheduled: { label: "Scheduled", className: "border-[#f2e0bd] bg-[#fdf3e3] text-[#6b4a10]" },
  draft: { label: "Draft", className: "border-border bg-surface text-muted" },
};

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground/80";

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

type Notice = { kind: ToastKind; message: string } | null;

export function BlogManager({ initialPosts, authors }: { initialPosts: AdminPost[]; authors: AdminAuthor[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [editing, setEditing] = useState<AdminPost | "new" | null>(null);
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) => (filter === "all" || p.type === filter) && (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [posts, filter, query]);

  const counts = useMemo(() => {
    const c = { draft: 0, scheduled: 0, published: 0 };
    for (const p of posts) c[postStatus(p.publishedAt)]++;
    return c;
  }, [posts]);

  function saved(post: AdminPost, message: string) {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
    setEditing(post);
    setNotice({ kind: "success", message });
  }

  function removed(id: number) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setEditing(null);
    setNotice({ kind: "success", message: "Post deleted." });
  }

  /* Deleting from the list, without opening the post first.
   *
   * The confirmation is part of the page rather than a window.confirm: a
   * browser that has been told to block this page's dialogs returns false from
   * confirm() without showing anything, so the button would appear to do
   * nothing at all. */
  async function removeFromList(post: AdminPost) {
    setConfirmingId(null);
    setDeletingId(post.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't delete the post.");
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setNotice({ kind: "success", message: `Deleted “${post.title}”.` });
    } catch (err) {
      setNotice({ kind: "error", message: err instanceof Error ? err.message : "Couldn't delete the post." });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {editing ? (
        <PostEditor
          key={editing === "new" ? "new" : editing.id}
          post={editing === "new" ? null : editing}
          authors={authors}
          onSaved={saved}
          onDeleted={removed}
          onClose={() => setEditing(null)}
          onError={(message) => setNotice({ kind: "error", message })}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "blog", "insight"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {f === "all" ? "All posts" : f === "blog" ? "Blog" : "Insights"}
              </button>
            ))}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles and tags"
              aria-label="Search posts"
              className={`${inputClass} max-w-xs`}
            />
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="ml-auto rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              + New post
            </button>
          </div>

          <p className="text-sm text-muted">
            {counts.published} published · {counts.scheduled} scheduled · {counts.draft} draft{counts.draft === 1 ? "" : "s"}. Drafts and
            scheduled posts are hidden from the public until their date.
          </p>

          <section className="overflow-hidden rounded-lg border border-border bg-background">
            {shown.length ? (
              <ul className="divide-y divide-border">
                {shown.map((p) => {
                  const status = STATUS_STYLE[postStatus(p.publishedAt)];
                  return (
                    <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                          <span className="text-xs uppercase tracking-[0.12em] text-muted">{p.type === "insight" ? "Insight" : "Blog"}</span>
                        </div>
                        <p className="font-display mt-1.5 font-semibold text-foreground">{p.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {p.publishedAt ? shortDate(p.publishedAt) : `Edited ${shortDate(p.updatedAt)}`}
                          {p.authorName ? ` · ${p.authorName}` : ""}
                          {p.readingMinutes ? ` · ${p.readingMinutes} min read` : ""}
                          {p.tags.length ? ` · ${p.tags.join(", ")}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {confirmingId === p.id ? (
                          <>
                            <span className="text-xs text-muted">
                              {postStatus(p.publishedAt) === "published"
                                ? "Delete for good? It's live on the site right now."
                                : "Delete for good? This can't be undone."}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromList(p)}
                              className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                            >
                              Keep
                            </button>
                          </>
                        ) : (
                          <>
                            {postStatus(p.publishedAt) === "published" ? (
                              <a
                                href={postPath(p)}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
                              >
                                View
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setEditing(p)}
                              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(p.id)}
                              disabled={deletingId === p.id}
                              className="rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-tint disabled:opacity-50"
                            >
                              {deletingId === p.id ? "Deleting…" : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted">
                {posts.length ? "No posts match that." : "No posts yet. Write the first one."}
              </p>
            )}
          </section>
        </div>
      )}

      {notice ? (
        <Toast kind={notice.kind} message={notice.message} onClose={() => setNotice(null)} duration={notice.kind === "success" ? 4000 : 8000} />
      ) : null}
    </>
  );
}

/* ---------------- editor ---------------- */

type Publish = "draft" | "now" | "schedule" | "keep";

/** A date the datetime-local input understands, in the viewer's own time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PostEditor({
  post,
  authors,
  onSaved,
  onDeleted,
  onClose,
  onError,
}: {
  post: AdminPost | null;
  authors: AdminAuthor[];
  onSaved: (post: AdminPost, message: string) => void;
  onDeleted: (id: number) => void;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const status = post ? postStatus(post.publishedAt) : "draft";
  const [title, setTitle] = useState(post?.title ?? "");
  const [type, setType] = useState<PostType>(post?.type ?? "blog");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [authorId, setAuthorId] = useState<string>(post?.authorId ? String(post.authorId) : "");
  const [body, setBody] = useState(post?.bodyMarkdown ?? "");
  const [publish, setPublish] = useState<Publish>(status === "published" ? "keep" : status === "scheduled" ? "schedule" : "draft");
  const [scheduleAt, setScheduleAt] = useState(status === "scheduled" ? toLocalInput(post?.publishedAt ?? null) : "");
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [cover, setCover] = useState<AdminImage | null>(post?.cover ?? null);
  const [coverAlt, setCoverAlt] = useState(post?.cover?.alt ?? "");
  const [uploading, setUploading] = useState<"cover" | "inline" | null>(null);
  // Images written into the article, by id, and any alt text edited here.
  const [images, setImages] = useState<Record<number, AdminImage>>({});
  const [altEdits, setAltEdits] = useState<Record<number, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const inlineIds = useMemo(() => imageIdsIn(body), [body]);

  // Thumbnails for images already in the article when it's opened.
  useEffect(() => {
    const missing = imageIdsIn(post?.bodyMarkdown ?? "");
    if (!missing.length) return;
    let cancelled = false;
    fetch(`/api/admin/blog/media?ids=${missing.join(",")}`)
      .then((r) => (r.ok ? r.json() : { images: [] }))
      .then((d: { images?: AdminImage[] }) => {
        if (!cancelled) setImages((prev) => ({ ...prev, ...Object.fromEntries((d.images ?? []).map((i) => [i.id, i])) }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [post?.bodyMarkdown]);

  async function upload(file: File, alt: string): Promise<AdminImage> {
    if (!IMAGE_TYPES.includes(file.type)) throw new Error("Use a JPEG, PNG or WebP image.");
    if (file.size > IMAGE_MAX_BYTES) throw new Error("That image is over 4 MB. Save it smaller and try again.");
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);
    const res = await fetch("/api/admin/blog/media", { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { image?: AdminImage; error?: string };
    if (!res.ok || !data.image) throw new Error(data.error || "Couldn't upload the image.");
    return data.image;
  }

  async function chooseCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("cover");
    try {
      const image = await upload(file, coverAlt.trim() || title.trim());
      setCover(image);
      setCoverAlt(image.alt);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't upload the image.");
    } finally {
      setUploading(null);
    }
  }

  async function insertImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("inline");
    try {
      const image = await upload(file, "");
      setImages((prev) => ({ ...prev, [image.id]: image }));
      // Drop it in where the cursor was, on a line of its own.
      const el = bodyRef.current;
      const at = el ? el.selectionStart : body.length;
      const before = body.slice(0, at).replace(/\s*$/, "");
      const after = body.slice(at).replace(/^\s*/, "");
      setBody(`${before}${before ? "\n\n" : ""}${imageToken(image.id)}${after ? "\n\n" : "\n"}${after}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't upload the image.");
    } finally {
      setUploading(null);
    }
  }

  /** Saves any image descriptions changed since they were uploaded. */
  async function saveAltText() {
    const edits: [number, string][] = Object.entries(altEdits)
      .map(([id, alt]) => [Number(id), alt.trim()] as [number, string])
      .filter(([id, alt]) => alt && images[id] && images[id].alt !== alt && inlineIds.includes(id));
    if (cover && coverAlt.trim() && coverAlt.trim() !== cover.alt) edits.push([cover.id, coverAlt.trim()]);
    for (const [id, alt] of edits) {
      const res = await fetch(`/api/admin/blog/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      });
      if (!res.ok) throw new Error("Couldn't save an image description.");
    }
    if (cover && coverAlt.trim()) setCover({ ...cover, alt: coverAlt.trim() });
    setImages((prev) => {
      const next = { ...prev };
      for (const [id, alt] of edits) if (next[id]) next[id] = { ...next[id], alt };
      return next;
    });
  }

  const words = body.split(/\s+/).filter(Boolean).length;

  function publishedAt(): string | null {
    if (publish === "draft") return null;
    if (publish === "keep") return post?.publishedAt ?? new Date().toISOString();
    if (publish === "now") return new Date().toISOString();
    return scheduleAt ? new Date(scheduleAt).toISOString() : null;
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return onError("Give the post a title.");
    if (publish === "schedule" && !scheduleAt) return onError("Pick the date and time to publish it.");

    setBusy("save");
    try {
      await saveAltText();
      const res = await fetch(post ? `/api/admin/blog/${post.id}` : "/api/admin/blog", {
        method: post ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          slug,
          excerpt,
          bodyMarkdown: body,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          authorId: authorId ? Number(authorId) : null,
          coverId: cover?.id ?? null,
          publishedAt: publishedAt(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { post?: AdminPost; error?: string };
      if (!res.ok || !data.post) throw new Error(data.error || "Couldn't save the post.");
      const now = postStatus(data.post.publishedAt);
      onSaved(data.post, now === "published" ? "Saved and live on the site." : now === "scheduled" ? "Saved — it goes live on its date." : "Draft saved.");
      setSlug(data.post.slug);
      if (now === "published") setPublish("keep");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't save the post.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!post || !window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't delete the post.");
      onDeleted(post.id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't delete the post.");
      setBusy(null);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onClose} className="text-sm font-medium text-muted transition-colors hover:text-foreground">
          ← All posts
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {post && status === "published" ? (
            <a
              href={postPath(post)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              View on site
            </a>
          ) : null}
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {busy === "save" ? <Spinner className="h-4 w-4" /> : null}
            {busy === "save" ? "Saving…" : post ? "Save changes" : "Create post"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* writing */}
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Title</span>
            <input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="font-display w-full border-0 border-b border-border bg-transparent px-0 pb-2 text-2xl font-bold tracking-tight text-foreground placeholder:text-muted focus:border-accent focus:outline-none sm:text-3xl"
            />
          </label>

          <label className="block">
            <span className={labelClass}>Summary</span>
            <textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="One or two sentences. Shown on the blog listing and in search results."
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-foreground/80">
              <span>Article (Markdown)</span>
              <span className="tabular-nums text-muted">
                {words.toLocaleString("en-IN")} words · about {Math.max(1, Math.round(words / 200))} min read
              </span>
            </span>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent">
                {uploading === "inline" ? <Spinner className="h-3.5 w-3.5" /> : null}
                {uploading === "inline" ? "Uploading…" : "Insert image"}
                <input type="file" accept={IMAGE_TYPES.join(",")} onChange={insertImage} disabled={uploading !== null} className="sr-only" />
              </label>
              <span className="text-xs text-muted">Goes where the cursor is.</span>
            </div>
            <textarea
              ref={bodyRef}
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={26}
              spellCheck
              placeholder={"## A section heading\n\nWrite in paragraphs. Leave a blank line between them.\n\n- Bullet points like this\n- **Bold** for key terms\n\n[Link text](https://www.dgbindia.com/nas-config)"}
              className={`${inputClass} font-mono text-[13px] leading-relaxed`}
            />
          </label>

          {inlineIds.length ? (
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-xs font-medium text-foreground/80">Images in this article</p>
              <ul className="mt-3 space-y-3">
                {inlineIds.map((id) => {
                  const image = images[id];
                  return (
                    <li key={id} className="flex items-center gap-3">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a CMS preview, not page content
                        <img src={image.url} alt="" className="h-12 w-20 shrink-0 rounded border border-border object-cover" />
                      ) : (
                        <span className="h-12 w-20 shrink-0 rounded border border-border bg-surface" />
                      )}
                      <input
                        value={altEdits[id] ?? image?.alt ?? ""}
                        onChange={(e) => setAltEdits((prev) => ({ ...prev, [id]: e.target.value }))}
                        placeholder="Describe this image"
                        aria-label={`Description for image ${id}`}
                        className={inputClass}
                      />
                      <code className="shrink-0 text-[11px] text-muted">{imageToken(id)}</code>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted">To remove an image, delete its line from the article.</p>
            </div>
          ) : null}

          <details className="rounded-md border border-border bg-surface px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-foreground">Formatting help</summary>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 font-mono text-xs text-muted">
              <dt>## Heading</dt>
              <dd className="font-sans">Section heading (use ### for a smaller one)</dd>
              <dt>**bold**</dt>
              <dd className="font-sans">Bold text</dd>
              <dt>*italic*</dt>
              <dd className="font-sans">Italic text</dd>
              <dt>- item</dt>
              <dd className="font-sans">Bullet list · use 1. for a numbered list</dd>
              <dt>[text](url)</dt>
              <dd className="font-sans">Link</dd>
              <dt>&gt; quote</dt>
              <dd className="font-sans">Quote</dd>
              <dt>![media:12]()</dt>
              <dd className="font-sans">An uploaded image — use Insert image rather than typing it</dd>
              <dt>blank line</dt>
              <dd className="font-sans">Starts a new paragraph</dd>
            </dl>
          </details>
        </div>

        {/* settings */}
        <aside className="space-y-5 rounded-lg border border-border bg-background p-5 lg:self-start">
          <div>
            <span className={labelClass}>Banner image</span>
            {cover ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- a CMS preview, not page content */}
                <img src={cover.url} alt={coverAlt || cover.alt} className="aspect-video w-full rounded-md border border-border object-cover" />
                <input
                  id="post-cover-alt"
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                  placeholder="Describe the image"
                  aria-label="Banner image description"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-full border border-border px-3 py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent">
                    {uploading === "cover" ? "Uploading…" : "Replace"}
                    <input type="file" accept={IMAGE_TYPES.join(",")} onChange={chooseCover} disabled={uploading !== null} className="sr-only" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCover(null)}
                    className="flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-tint"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-strong bg-surface px-4 text-center transition-colors hover:border-accent">
                {uploading === "cover" ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <>
                    <span className="text-sm font-medium text-foreground">Upload banner</span>
                    <span className="text-xs text-muted">Without one, a drawn cover is used</span>
                  </>
                )}
                <input type="file" accept={IMAGE_TYPES.join(",")} onChange={chooseCover} disabled={uploading !== null} className="sr-only" />
              </label>
            )}
            <span className="mt-1.5 block text-xs text-muted">JPEG, PNG or WebP, up to 4 MB. Landscape (16:9) looks best.</span>
          </div>

          <fieldset>
            <legend className={labelClass}>Visibility</legend>
            <div className="space-y-2 text-sm">
              {post && status === "published" ? <Radio name="publish" value="keep" current={publish} onChange={setPublish} label="Published" /> : null}
              <Radio name="publish" value="draft" current={publish} onChange={setPublish} label="Draft — only visible here" />
              {!post || status !== "published" ? <Radio name="publish" value="now" current={publish} onChange={setPublish} label="Publish now" /> : null}
              <Radio name="publish" value="schedule" current={publish} onChange={setPublish} label="Schedule for later" />
            </div>
            {publish === "schedule" ? (
              <input
                id="post-schedule"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            ) : null}
          </fieldset>

          <label className="block">
            <span className={labelClass}>Section</span>
            <select id="post-type" value={type} onChange={(e) => setType(e.target.value as PostType)} className={inputClass}>
              <option value="blog">Blog</option>
              <option value="insight">Insight</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Author</span>
            <select id="post-author" value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={inputClass}>
              <option value="">No author shown</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Tags</span>
            <input id="post-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="NAS, RAID, Storage" className={inputClass} />
            <span className="mt-1 block text-xs text-muted">Separate with commas.</span>
          </label>

          <label className="block">
            <span className={labelClass}>Web address</span>
            <input id="post-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="made from the title" className={`${inputClass} font-mono text-xs`} />
            <span className="mt-1 block text-xs text-muted">Changing it after publishing breaks existing links.</span>
          </label>

          {post ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy !== null}
              className="w-full rounded-full px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-tint disabled:opacity-60"
            >
              {busy === "delete" ? "Deleting…" : "Delete post"}
            </button>
          ) : null}
        </aside>
      </div>
    </form>
  );
}

function Radio({
  name,
  value,
  current,
  onChange,
  label,
}: {
  name: string;
  value: Publish;
  current: Publish;
  onChange: (v: Publish) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-foreground">
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} className="accent-[#80202c]" />
      {label}
    </label>
  );
}
