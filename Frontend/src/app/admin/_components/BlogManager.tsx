"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Toast, type ToastKind } from "@/components/ui/Toast";
import { postPath, postStatus, type AdminAuthor, type AdminPost, type PostStatus, type PostType } from "@/lib/blog-types";

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
                      <div className="flex shrink-0 gap-2">
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
            <textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={26}
              spellCheck
              placeholder={"## A section heading\n\nWrite in paragraphs. Leave a blank line between them.\n\n- Bullet points like this\n- **Bold** for key terms\n\n[Link text](https://www.dgbindia.com/nas-config)"}
              className={`${inputClass} font-mono text-[13px] leading-relaxed`}
            />
          </label>

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
              <dt>blank line</dt>
              <dd className="font-sans">Starts a new paragraph</dd>
            </dl>
          </details>
        </div>

        {/* settings */}
        <aside className="space-y-5 rounded-lg border border-border bg-background p-5 lg:self-start">
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
