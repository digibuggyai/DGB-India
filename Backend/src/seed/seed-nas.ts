// Loads the NAS configurator price list (models, drives, installation, AMC)
// into the CMS. Values are from the pricing sheet: quote price and the
// "with tax minimum".
//
// Safe to re-run: it only creates what's missing and never overwrites a price
// already in the CMS, so edits made in the admin panel are kept.
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";
import { DRIVES } from "./nas-drive-prices";

const config = (importedConfig as any)?.default ?? importedConfig;

const TWO_BAY = ["RAID0", "RAID1"];
const ALL_RAID = ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"];

const MODELS = [
  { model: "DS223J", brand: "Synology", bays: 2, raid: TWO_BAY, expandable: false, network: "1GbE ×1", networkUpgrade: "", quotePrice: 24000, minPrice: 22420 },
  { model: "DS225+", brand: "Synology", bays: 2, raid: TWO_BAY, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "", quotePrice: 42000, minPrice: 40120 },
  { model: "DS725+", brand: "Synology", bays: 2, raid: TWO_BAY, expandable: true, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "", quotePrice: 94000, minPrice: 89680 },
  { model: "TS-233-2G", brand: "QNAP", bays: 2, raid: TWO_BAY, expandable: false, network: "1GbE ×1", networkUpgrade: "", quotePrice: 24000, minPrice: 22420 },
  { model: "TS-216G-4G", brand: "QNAP", bays: 2, raid: TWO_BAY, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "", quotePrice: 29000, minPrice: 27730 },
  { model: "DS425+", brand: "Synology", bays: 4, raid: ALL_RAID, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "", quotePrice: 67000, minPrice: 63720 },
  { model: "DS925+", brand: "Synology", bays: 4, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "", quotePrice: 97000, minPrice: 92630 },
  { model: "TS-433-4G", brand: "QNAP", bays: 4, raid: ALL_RAID, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "", quotePrice: 45000, minPrice: 42480 },
  { model: "TS-462-4G", brand: "QNAP", bays: 4, raid: ALL_RAID, expandable: true, network: "2.5GbE ×1", networkUpgrade: "10GbE via PCIe card", quotePrice: 57000, minPrice: 54280 },
  { model: "TS-464-8G", brand: "QNAP", bays: 4, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "10GbE via PCIe card", quotePrice: 69000, minPrice: 66080 },
  { model: "DS1525+", brand: "Synology", bays: 5, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "10GbE via E10G22-T1-Mini module", quotePrice: 142000, minPrice: 135700 },
  { model: "TS-664-8G", brand: "QNAP", bays: 6, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "10GbE via PCIe card", quotePrice: 87000, minPrice: 82600 },
  { model: "DS1825+", brand: "Synology", bays: 8, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "up to 25GbE via PCIe add-in card", quotePrice: 180000, minPrice: 171100 },
  { model: "TS-832PX-4G", brand: "QNAP", bays: 8, raid: ALL_RAID, expandable: true, network: "10GbE SFP+ ×2 + 2.5GbE ×2", networkUpgrade: "", quotePrice: 108000, minPrice: 103250 },
  { model: "TS-873A-8G", brand: "QNAP", bays: 8, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "5GbE/10GbE via PCIe Gen3 card", quotePrice: 130000, minPrice: 123900 },
];

const SETTINGS = { installQuote: 5900, installMin: 4130, amcQuotePercent: 10, amcMinPercent: 7 };

async function main() {
  const payload: any = await getPayload({ config });
  let modelsCreated = 0;
  let drivesCreated = 0;

  for (const m of MODELS) {
    const found = await payload.find({ collection: "nas-models", where: { model: { equals: m.model } }, limit: 1, overrideAccess: true });
    if (found.docs.length) continue;
    await payload.create({ collection: "nas-models", data: { ...m, active: true }, overrideAccess: true });
    modelsCreated++;
  }

  for (const [capacityTb, line, quotePrice, minPrice] of DRIVES) {
    const found = await payload.find({
      collection: "nas-drives",
      where: { and: [{ capacityTb: { equals: capacityTb } }, { line: { equals: line } }] },
      limit: 1,
      overrideAccess: true,
    });
    if (found.docs.length) continue;
    await payload.create({ collection: "nas-drives", data: { capacityTb, line, quotePrice, minPrice, active: true }, overrideAccess: true });
    drivesCreated++;
  }

  const current = await payload.findGlobal({ slug: "nas-settings", overrideAccess: true });
  const settingsSet = current?.installQuote != null;
  if (!settingsSet) await payload.updateGlobal({ slug: "nas-settings", data: SETTINGS, overrideAccess: true });

  console.log(`NAS models: ${modelsCreated} created (${MODELS.length - modelsCreated} already present)`);
  console.log(`NAS drives: ${drivesCreated} created (${DRIVES.length - drivesCreated} already present)`);
  console.log(`Installation & AMC: ${settingsSet ? "already set — left unchanged" : "set"}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
