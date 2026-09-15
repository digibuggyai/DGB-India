import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireAdmin } from "@/lib/nas/admin-guard";
import { PRICING_TAG, deleteRecord, isKind, sanitize, updateRecord } from "@/lib/nas/cms";
import type { Kind } from "@/lib/nas/cms-types";

type Params = { params: Promise<{ collection: string; id: string }> };

async function resolve({ params }: Params): Promise<{ kind: Kind; id: number } | NextResponse> {
  const { collection, id } = await params;
  if (!isKind(collection) || !Number.isInteger(Number(id))) {
    return NextResponse.json({ error: "Unknown item." }, { status: 404 });
  }
  return { kind: collection, id: Number(id) };
}

export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  const target = await resolve(ctx);
  if (target instanceof NextResponse) return target;

  try {
    await updateRecord(auth.token, target.kind, target.id, sanitize(target.kind, await req.json().catch(() => null)));
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return cmsErrorResponse(err);
  }
}

export async function DELETE(_req: Request, ctx: Params) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  const target = await resolve(ctx);
  if (target instanceof NextResponse) return target;

  try {
    await deleteRecord(auth.token, target.kind, target.id);
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return cmsErrorResponse(err);
  }
}
