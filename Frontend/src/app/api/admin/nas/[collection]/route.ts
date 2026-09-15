import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireAdmin } from "@/lib/nas/admin-guard";
import { PRICING_TAG, createRecord, isKind, sanitize } from "@/lib/nas/cms";

export async function POST(req: Request, { params }: { params: Promise<{ collection: string }> }) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();

  const { collection } = await params;
  if (!isKind(collection)) return NextResponse.json({ error: "Unknown item type." }, { status: 404 });

  try {
    await createRecord(auth.token, collection, sanitize(collection, await req.json().catch(() => null)));
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return cmsErrorResponse(err);
  }
}
