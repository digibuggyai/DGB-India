import { NextResponse } from "next/server";
import { BlogError, listImages, uploadImage } from "@/lib/blog-admin";
import { IMAGE_MAX_BYTES, IMAGE_TYPES } from "@/lib/blog-types";
import { requireAdmin } from "@/lib/nas/admin-guard";

/* Banner and article images for the admin Blog tab. */

const forbidden = () => NextResponse.json({ error: "Only admins can upload images." }, { status: 403 });
const failed = (err: unknown) =>
  NextResponse.json(
    { error: err instanceof Error ? err.message : "Something went wrong." },
    { status: err instanceof BlogError && err.status < 500 ? err.status : 502 },
  );

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG or WebP image." }, { status: 400 });
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: "That image is over 4 MB. Save it smaller and try again." }, { status: 413 });
  }

  const alt = String(form?.get("alt") ?? "").trim() || file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
  try {
    return NextResponse.json({ image: await uploadImage(auth.token, file, alt) });
  } catch (err) {
    return failed(err);
  }
}

/** Looks up images already written into an article, for its thumbnails. */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();

  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 50);
  try {
    return NextResponse.json({ images: await listImages(auth.token, ids) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return failed(err);
  }
}
