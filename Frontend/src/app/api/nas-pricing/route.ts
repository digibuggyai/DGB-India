import { NextResponse } from "next/server";
import { normalisePricing } from "@/lib/nas/normalise";

/* Server-side proxy to the DigiBuggy pricing service.
 *
 * It has two jobs. The pricing service sends no CORS headers, so a visitor's
 * browser can't call it from this site directly. And this is the boundary where
 * the payload is rebuilt quote-only (see normalisePricing) before anything
 * reaches the page. */

const UPSTREAM = process.env.NAS_PRICING_URL || "http://localhost:3000/api/pricing/public";

// Prices are edited in the pricing admin; re-read them at most every 5 minutes.
const REVALIDATE_SECONDS = 300;

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`upstream responded ${res.status}`);

    const result = normalisePricing(await res.json());
    if (!result.ok) throw new Error(`upstream payload unusable: ${result.reason}`);

    return NextResponse.json(result.pricing, {
      headers: { "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=600` },
    });
  } catch (err) {
    console.error("[nas-pricing]", err instanceof Error ? err.message : err);
    // no-store so a passing outage isn't cached at the edge and served for minutes.
    return NextResponse.json(
      { error: "Live pricing is unavailable right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
