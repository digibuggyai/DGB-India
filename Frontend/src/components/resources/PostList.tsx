import Link from "next/link";
import type { Post } from "@/payload-types";

export function PostList({ posts, basePath }: { posts: Post[]; basePath: string }) {
  if (posts.length === 0) {
    return <p className="text-muted">Nothing published yet — check back soon.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`${basePath}/${post.slug}`}
          className="group flex flex-col rounded-lg border border-border p-6 transition-colors hover:border-accent/60 hover:bg-surface"
        >
          <div className="font-medium text-foreground group-hover:text-accent-2">{post.title}</div>
          {post.excerpt && <p className="mt-2 text-sm text-muted">{post.excerpt}</p>}
          {post.publishedAt && (
            <div className="mt-4 font-mono text-xs text-muted">
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
