import { NextResponse } from "next/server";
import { BlogError, createPost, listAuthors, listPosts, revalidateBlog, sanitizePost } from "@/lib/blog-admin";
import { requireAdmin } from "@/lib/nas/admin-guard";

const forbidden = () => NextResponse.json({ error: "Only admins can manage the blog." }, { status: 403 });
const failed = (err: unknown) =>
  NextResponse.json(
    { error: err instanceof Error ? err.message : "Something went wrong." },
    { status: err instanceof BlogError && err.status < 500 ? err.status : 502 },
  );

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  try {
    const [posts, authors] = await Promise.all([listPosts(auth.token), listAuthors(auth.token)]);
    return NextResponse.json({ posts, authors }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return failed(err);
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  try {
    const data = sanitizePost(await req.json().catch(() => null));
    if (!data.title) return NextResponse.json({ error: "Give the post a title." }, { status: 400 });
    const post = await createPost(auth.token, data);
    revalidateBlog(post);
    return NextResponse.json({ post });
  } catch (err) {
    return failed(err);
  }
}
