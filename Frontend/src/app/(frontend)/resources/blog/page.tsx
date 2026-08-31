import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PostList } from "@/components/resources/PostList";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Educational and technical content on enterprise infrastructure.",
};

export default async function BlogPage() {
  const posts = await getPosts("blog");
  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Resources / Blog</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Blog</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="container-page">
          <PostList posts={posts} basePath="/resources/blog" />
        </div>
      </section>
    </>
  );
}
