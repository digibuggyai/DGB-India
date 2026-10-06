/* How far each unit grows with an expansion enclosure attached.
 *
 * The two brands do this differently, and the catalogue has to say so:
 *
 *   Synology expands only on units built for it, over a dedicated port, with a
 *   DX-series shelf. Its spec pages publish both the bay count and the raw
 *   capacity, and every figure below was read off them (October 2026). Where a
 *   model has no expansion, Synology says nothing at all — DS223J, DS225+ and
 *   DS425+ are standalone units, confirmed on their own pages.
 *
 *   QNAP expands over USB, on nearly every model it sells, with a TR- or TL-
 *   series enclosure. Its spec sheets carry a "JBOD Expansion: supported" line
 *   rather than a bay total, and how many enclosures a model takes lives on an
 *   interactive compatibility page that can't be read automatically. So those
 *   units are marked expandable — which is what the spec sheet says — and
 *   carry a note instead of a number, except where we already hold a figure.
 *
 * A bay count nobody has verified would end up on a customer's quotation, so
 * none is invented here.
 *
 *   npx tsx src/seed/seed-expansion.ts
 */
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

type Expansion = { expandable: boolean; baysWithExpansion: number | null; expansionNote: string };

const UNITS: Record<string, Expansion> = {
  // Synology — figures from synology.com, October 2026.
  "DS223J": { expandable: false, baysWithExpansion: null, expansionNote: "" },
  "DS225+": { expandable: false, baysWithExpansion: null, expansionNote: "" },
  "DS425+": { expandable: false, baysWithExpansion: null, expansionNote: "" },
  "DS725+": { expandable: true, baysWithExpansion: 7, expansionNote: "DX525 expansion unit" },
  "DS925+": { expandable: true, baysWithExpansion: 9, expansionNote: "DX525 expansion unit" },
  "DS1525+": { expandable: true, baysWithExpansion: 15, expansionNote: "Two DX525 expansion units" },
  "DS1825+": { expandable: true, baysWithExpansion: 18, expansionNote: "Two DX525 expansion units" },

  // QNAP — every model supports JBOD expansion over USB.
  "TS-233-2G": { expandable: true, baysWithExpansion: null, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-216G-4G": { expandable: true, baysWithExpansion: null, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-433-4G": { expandable: true, baysWithExpansion: null, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-462-4G": { expandable: true, baysWithExpansion: null, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-464-8G": { expandable: true, baysWithExpansion: 12, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-664-8G": { expandable: true, baysWithExpansion: null, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-832PX-4G": { expandable: true, baysWithExpansion: 16, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
  "TS-873A-8G": { expandable: true, baysWithExpansion: 16, expansionNote: "USB expansion enclosure (TR- or TL-series)" },
};

async function main() {
  const payload: any = await getPayload({ config });
  const found = await payload.find({ collection: "nas-models", limit: 500, overrideAccess: true, depth: 0 });

  let updated = 0;
  let unchanged = 0;
  const missing: string[] = [];

  for (const doc of found.docs) {
    const want = UNITS[doc.model as string];
    if (!want) {
      missing.push(doc.model);
      continue;
    }
    const changes: Record<string, unknown> = {};
    if (doc.expandable !== want.expandable) changes.expandable = want.expandable;
    if ((doc.baysWithExpansion ?? null) !== want.baysWithExpansion) changes.baysWithExpansion = want.baysWithExpansion;
    if ((doc.expansionNote ?? "") !== want.expansionNote) changes.expansionNote = want.expansionNote;

    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }
    await payload.update({ collection: "nas-models", id: doc.id, data: changes, overrideAccess: true });
    const grows = want.baysWithExpansion ? `${want.baysWithExpansion} bays` : want.expandable ? "no bay count on record" : "not expandable";
    console.log(`  ~ ${String(doc.model).padEnd(12)} ${Object.keys(changes).join(", ").padEnd(40)} → ${grows}`);
    updated++;
  }

  console.log(`\n${updated} updated, ${unchanged} already correct.`);
  if (missing.length) console.log(`Not in this list, left alone: ${missing.join(", ")}`);

  const noCount = Object.entries(UNITS).filter(([, u]) => u.expandable && !u.baysWithExpansion).map(([m]) => m);
  if (noCount.length) {
    console.log(`\nExpandable but with no verified bay count: ${noCount.join(", ")}.`);
    console.log("Those show the note instead of a number until QNAP's figure is confirmed.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
