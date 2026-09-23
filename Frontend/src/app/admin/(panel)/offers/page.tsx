import { Eyebrow } from "@/components/ui/Eyebrow";
import { OfferCodesManager } from "../../_components/OfferCodesManager";
import { getOfferCodes } from "../../_lib/offer-codes";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const codes = await getOfferCodes();
  const live = codes.filter((c) => c.status === "issued").length;

  return (
    <div className="container-page py-10">
      <Eyebrow>Offer codes</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Discount codes</h1>
          <p className="mt-3 max-w-xl text-muted">
            Every code the NAS configurator has issued, and who holds it. Each customer gets their own — a code is valid for the person
            it was issued to, once. Mark one used when it&rsquo;s been applied to a quotation.
          </p>
        </div>
        <span className="text-sm text-muted">
          {live} outstanding · {codes.length} issued in all
        </span>
      </div>

      <div className="mt-8">
        <OfferCodesManager initial={codes} />
      </div>
    </div>
  );
}
