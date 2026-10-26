// Applies the chassis prices in nas-model-prices.ts to the CMS, the way
// seed-nas-drives.ts does for drives: corrects prices that have moved and
// leaves everything else — specs, Active ticks — alone.
//
// Safe to re-run: it only writes rows that actually differ, and it touches
// quotePrice and minPrice only. A model in the CMS with no price on the sheet
// is reported rather than changed.
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";
import { MODEL_PRICES } from "./nas-model-prices";

const config = (importedConfig as any)?.default ?? importedConfig;
const inr = (v: unknown) => (typeof v === "number" ? `₹${v.toLocaleString("en-IN")}` : "—");

async function main() {
  const payload: any = await getPayload({ config });
  const all = await payload.find({ collection: "nas-models", limit: 500, overrideAccess: true, depth: 0 });

  const updated: string[] = [];
  const missing: string[] = [];
  let unchanged = 0;

  for (const [model, [quotePrice, minPrice]] of Object.entries(MODEL_PRICES)) {
    const doc = all.docs.find((d: any) => d.model === model);
    if (!doc) {
      missing.push(model);
      continue;
    }

    const changes: Record<string, number> = {};
    if (doc.quotePrice !== quotePrice) changes.quotePrice = quotePrice;
    if (doc.minPrice !== minPrice) changes.minPrice = minPrice;
    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }

    /* A floor above its own quote would let the configurator quote below the
     * floor, which is the one thing this pricing must never do. */
    const finalQuote = changes.quotePrice ?? doc.quotePrice;
    const finalMin = changes.minPrice ?? doc.minPrice;
    if (typeof finalMin === "number" && finalMin >= finalQuote) {
      throw new Error(`${model}: minimum ${inr(finalMin)} is not below the quote ${inr(finalQuote)} — refusing to write.`);
    }

    await payload.update({ collection: "nas-models", id: doc.id, data: changes, overrideAccess: true });
    updated.push(
      `${model} — ${Object.entries(changes)
        .map(([k, v]) => `${k === "quotePrice" ? "quote" : "minimum"} ${inr(doc[k])} → ${inr(v)}`)
        .join(", ")}`,
    );
  }

  const extra = all.docs.filter((d: any) => !(d.model in MODEL_PRICES)).map((d: any) => d.model);

  console.log(`Updated ${updated.length}:`);
  for (const u of updated) console.log(`  ~ ${u}`);
  console.log(`Unchanged: ${unchanged}`);
  if (missing.length) console.log(`On the sheet but not in the CMS: ${missing.join(", ")}`);
  if (extra.length) console.log(`In the CMS but not on the sheet, left alone: ${extra.join(", ")}`);
  console.log(`Models in the CMS: ${all.totalDocs}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
