import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireAdmin } from "@/lib/nas/admin-guard";
import { loadCatalogue } from "@/lib/nas/cms";

// Full price list including minimums — admins only.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return forbidden();
  try {
    return NextResponse.json(await loadCatalogue(auth.token), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return cmsErrorResponse(err);
  }
}
