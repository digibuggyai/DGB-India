import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichText } from "@/components/ui/RichText";
import type { Post } from "@/payload-types";

export function PostDetail({ post, kicker }: { post: Post; kicker: string }) {
  const author = typeof post.author === "object" ? post.author : null;

  return (
    <article>
      <section className="border-b border-border py-20">
        <div className="container-page max-w-3xl">
          <Eyebrow>{kicker}</Eyebrow>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            {author?.name && <span>{author.name}</span>}
            {post.publishedAt && (
              <>
                {author?.name && <span>·</span>}
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container-page max-w-3xl">
          <RichText data={post.body} />
        </div>
      </section>
    </article>
  );
}
