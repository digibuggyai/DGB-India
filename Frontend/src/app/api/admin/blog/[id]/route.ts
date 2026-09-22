import { NextResponse } from "next/server";
import { BlogError, deletePost, revalidateBlog, sanitizePost, updatePost } from "@/lib/blog-admin";
import { requireAdmin } from "@/lib/nas/admin-guard";

type Params = { params: Promise<{ id: string }> };

const forbidden = () => NextResponse.json({ error: "Only admins can manage the blog." }, { status: 403 });
const failed = (err: unknown) =>
  NextResponse.json(
    { error: err instanceof Error ? err.message : "Something went wrong." },
    { status: err instanceof BlogError && err.status < 500 ? err.status : 502 },
  );

async function postId({ params }: Params): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  const id = await postId(ctx);
  if (!id) return NextResponse.json({ error: "Unknown post." }, { status: 404 });
  try {
    const data = sanitizePost(await req.json().catch(() => null));
    if ("title" in data && !data.title) return NextResponse.json({ error: "A post needs a title." }, { status: 400 });
    const post = await updatePost(auth.token, id, data);
    revalidateBlog(post);
    return NextResponse.json({ post });
  } catch (err) {
    return failed(err);
  }
}

export async function DELETE(_req: Request, ctx: Params) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  const id = await postId(ctx);
  if (!id) return NextResponse.json({ error: "Unknown post." }, { status: 404 });
  try {
    await deletePost(auth.token, id);
    revalidateBlog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failed(err);
  }
}
