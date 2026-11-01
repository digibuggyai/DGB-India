import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireStaff } from "@/lib/nas/admin-guard";
import { loadCatalogue } from "@/lib/nas/cms";
import { toSalesPricing } from "@/lib/nas/sales-pricing";

export async function GET() {
  const auth = await requireStaff();
  if (!auth) return forbidden();

  try {
    const pricing = toSalesPricing(await loadCatalogue(auth.token));
    return NextResponse.json(pricing, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return cmsErrorResponse(err);
  }
}
