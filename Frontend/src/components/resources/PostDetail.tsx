import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import type { Post } from "@/payload-types";
import { PostCard } from "./PostCard";
import { authorOf, coverOf, postDate, postTags, readingLabel } from "./postMeta";

/* One article: header, body, a route to a quote, and more to read. */

export function PostDetail({
  post,
  kicker,
  basePath,
  related = [],
}: {
  post: Post;
  kicker: string;
  basePath: string;
  related?: Post[];
}) {
  const author = authorOf(post);
  const cover = coverOf(post);
  const tags = postTags(post);
  const meta = [postDate(post), readingLabel(post)].filter(Boolean);

  return (
    <article>
      <header className="border-b border-border bg-surface py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/resources" className="hover:text-accent">
              Resources
            </Link>
            <span className="mx-2">/</span>
            <Link href={basePath} className="hover:text-accent">
              {kicker === "Insight" ? "Insights" : "Blog"}
            </Link>
          </nav>

          {tags.length ? (
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <li key={t} className="rounded-full border border-border-strong bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
                  {t}
                </li>
              ))}
            </ul>
          ) : null}

          <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{post.excerpt}</p> : null}

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-sm">
            {author ? (
              <span>
                <span className="font-medium text-foreground">{author.name}</span>
                {author.role ? <span className="text-muted"> · {author.role}</span> : null}
              </span>
            ) : null}
            {meta.length ? <span className="tabular-nums text-muted">{meta.join(" · ")}</span> : null}
          </div>
        </div>
      </header>

      {cover ? (
        <div className="container-page mt-10 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-surface">
            <Image src={cover.url} alt={cover.alt} fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
          </div>
        </div>
      ) : null}

      <div className="container-page max-w-3xl py-12 sm:py-16">
        <RichText
          data={post.body}
          className="prose-lg prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:font-medium prose-a:underline-offset-4 prose-blockquote:border-l-accent prose-blockquote:text-foreground prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none"
        />

        <aside className="mt-14 rounded-lg border border-border bg-tint/60 p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Planning storage for your team?</p>
          <p className="font-display mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Size and price a NAS in two minutes, or talk it through with an engineer.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/nas-config">Configure a NAS</ButtonLink>
            <ButtonLink href="/request-a-solution" variant="secondary">
              Talk to an expert
            </ButtonLink>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="border-t border-border bg-surface py-14 sm:py-20">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold tracking-tight">More {kicker === "Insight" ? "insights" : "from the blog"}</h2>
              <Link href={basePath} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} href={`${basePath}/${p.slug}`} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
