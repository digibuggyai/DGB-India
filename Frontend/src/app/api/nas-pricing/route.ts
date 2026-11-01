import { NextResponse } from "next/server";
import { loadCatalogue, toPricingInput } from "@/lib/nas/cms";
import { normalisePricing } from "@/lib/nas/normalise";

export async function GET() {
  try {
    const result = normalisePricing(toPricingInput(await loadCatalogue()));
    if (!result.ok) throw new Error(`price list unusable: ${result.reason}`);
    return NextResponse.json(result.pricing, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[nas-pricing]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Live pricing is unavailable right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
