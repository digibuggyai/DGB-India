import { NextResponse } from "next/server";
import { BlogError, updateImageAlt } from "@/lib/blog-admin";
import { requireAdmin } from "@/lib/nas/admin-guard";

/** Updates an image's description — what screen readers and search engines read. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Only admins can edit images." }, { status: 403 });

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Unknown image." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { alt?: unknown };
  const alt = String(body.alt ?? "").trim();
  if (!alt) return NextResponse.json({ error: "Describe the image." }, { status: 400 });

  try {
    return NextResponse.json({ image: await updateImageAlt(auth.token, id, alt) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: err instanceof BlogError && err.status < 500 ? err.status : 502 },
    );
  }
}
