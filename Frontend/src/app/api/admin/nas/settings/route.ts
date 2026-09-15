import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireAdmin } from "@/lib/nas/admin-guard";
import { PRICING_TAG, sanitizeSettings, updateSettings } from "@/lib/nas/cms";

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();

  try {
    await updateSettings(auth.token, sanitizeSettings(await req.json().catch(() => null)));
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return cmsErrorResponse(err);
  }
}
