import type { Post } from "@/payload-types";
import { FeaturedPostCard, PostCard } from "./PostCard";

/* The newest post leads, full width; the rest follow in a grid. */
export function PostList({ posts, basePath }: { posts: Post[]; basePath: string }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-background px-6 py-14 text-center">
        <p className="font-display text-lg font-bold tracking-tight text-foreground">Nothing published yet</p>
        <p className="mt-2 text-sm text-muted">New articles are on the way — check back soon.</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;
  return (
    <div className="space-y-10">
      <FeaturedPostCard post={featured} href={`${basePath}/${featured.slug}`} />
      {rest.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.id} post={post} href={`${basePath}/${post.slug}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
