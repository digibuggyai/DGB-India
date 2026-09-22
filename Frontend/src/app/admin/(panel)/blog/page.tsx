import { Eyebrow } from "@/components/ui/Eyebrow";
import { getAdminToken, getAdminUser } from "@/lib/admin-auth";
import { listAuthors, listPosts } from "@/lib/blog-admin";
import type { AdminAuthor, AdminPost } from "@/lib/blog-types";
import { BlogManager } from "../../_components/BlogManager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const [user, token] = await Promise.all([getAdminUser(), getAdminToken()]);

  let posts: AdminPost[] | null = null;
  let authors: AdminAuthor[] = [];
  let error: string | null = null;
  if (user?.role === "admin" && token) {
    try {
      [posts, authors] = await Promise.all([listPosts(token), listAuthors(token)]);
    } catch (err) {
      error = err instanceof Error ? err.message : "Couldn't load the posts.";
    }
  }

  return (
    <div className="container-page py-10">
      <Eyebrow>Blog</Eyebrow>
      <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Blog &amp; Insights</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Write, schedule and publish posts for the Blog and Insights sections. Posts written here can also be edited in the CMS.
      </p>

      <div className="mt-8">
        {user?.role !== "admin" ? (
          <Panel title="Admins only">Only an admin account can manage the blog.</Panel>
        ) : error || !posts ? (
          <Panel title="Couldn't load the posts">{error ?? "The CMS isn't reachable right now."}</Panel>
        ) : (
          <BlogManager initialPosts={posts} authors={authors} />
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}
