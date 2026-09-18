import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireStaff } from "@/lib/nas/admin-guard";
import { loadCatalogue } from "@/lib/nas/cms";
import { toSalesPricing } from "@/lib/nas/sales-pricing";

/* The sales configurator's price list: quotes plus the internal floor.
 *
 * Staff only and never cached. The customer-facing configurator reads
 * /api/nas-pricing instead, which strips every minimum out. */
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
