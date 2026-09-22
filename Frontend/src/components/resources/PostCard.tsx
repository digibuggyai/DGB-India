import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/payload-types";
import { coverOf, postDate, postTags, readingLabel } from "./postMeta";

/* Cards for the blog and insights listings. A post without a cover image gets
 * a drawn cover instead — engineering-paper grid on ink, with its section and
 * lead tag — so the grid reads as designed whether or not anyone uploaded art. */

export function CoverArt({ post, className = "" }: { post: Post; className?: string }) {
  const cover = coverOf(post);
  if (cover) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image src={cover.url} alt={cover.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      </div>
    );
  }

  const tag = postTags(post)[0];
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden bg-ink-800 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#80202c]/35 to-transparent" />
      <div className="absolute left-5 top-5 flex items-center gap-2">
        <span className="h-px w-5 bg-[#d4808b]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e9c7cc]">{post.type === "insight" ? "Insight" : "Blog"}</span>
      </div>
      {tag ? <span className="font-display absolute bottom-5 left-5 right-5 truncate text-lg font-bold tracking-tight text-white/90">{tag}</span> : null}
    </div>
  );
}

function Meta({ post }: { post: Post }) {
  const parts = [postDate(post), readingLabel(post)].filter(Boolean);
  return parts.length ? <p className="text-xs tabular-nums text-muted">{parts.join(" · ")}</p> : null;
}

function Tags({ post, limit = 3 }: { post: Post; limit?: number }) {
  const tags = postTags(post).slice(0, limit);
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function PostCard({ post, href }: { post: Post; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <CoverArt post={post} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Tags post={post} />
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt ? <p className="line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p> : null}
        <div className="mt-auto pt-2">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}

export function FeaturedPostCard({ post, href }: { post: Post; href: string }) {
  return (
    <Link
      href={href}
      className="group grid overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:grid-cols-[1.1fr_1fr]"
    >
      <CoverArt post={post} className="aspect-[16/9] md:aspect-auto md:min-h-[320px]" />
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Latest</p>
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-3xl">
          {post.title}
        </h2>
        {post.excerpt ? <p className="leading-relaxed text-muted">{post.excerpt}</p> : null}
        <Tags post={post} limit={4} />
        <div className="flex items-center justify-between gap-4 pt-2">
          <Meta post={post} />
          <span className="text-sm font-medium text-accent">Read article →</span>
        </div>
      </div>
    </Link>
  );
}
