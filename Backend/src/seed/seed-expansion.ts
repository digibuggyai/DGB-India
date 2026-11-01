import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

type Expansion = { expandable: boolean; baysWithExpansion: number | null; expansionNote: string };

const UNITS: Record<string, Expansion> = {
  "DS223J": { expandable: false, baysWithExpansion: null, expansionNote: "" },
  "DS225+": { expandable: false, baysWithExpansion: null, expansionNote: "" },
  "DS425+": { expandable: false, baysWithExpansion: null, expansionNote: "" },
  "DS725+": { expandable: true, baysWithExpansion: 7, expansionNote: "DX525 expansion unit" },
  "DS925+": { expandable: true, baysWithExpansion: 9, expansionNote: "DX525 expansion unit" },
  "DS1525+": { expandable: true, baysWithExpansion: 15, expansionNote: "Two DX525 expansion units" },
  "DS1825+": { expandable: true, baysWithExpansion: 18, expansionNote: "Two DX525 expansion units" },

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
