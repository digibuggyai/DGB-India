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
import { MODEL_PRICES } from "./nas-model-prices";

const config = (importedConfig as any)?.default ?? importedConfig;

const TWO_BAY = ["RAID0", "RAID1"];
const ALL_RAID = ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"];

const MODELS = [
  { model: "DS223J", brand: "Synology", bays: 2, raid: TWO_BAY, expandable: false, network: "1GbE ×1", networkUpgrade: "" },
  { model: "DS225+", brand: "Synology", bays: 2, raid: TWO_BAY, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "" },
  { model: "DS725+", brand: "Synology", bays: 2, raid: TWO_BAY, expandable: true, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "" },
  { model: "TS-233-2G", brand: "QNAP", bays: 2, raid: TWO_BAY, expandable: false, network: "1GbE ×1", networkUpgrade: "" },
  { model: "TS-216G-4G", brand: "QNAP", bays: 2, raid: TWO_BAY, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "" },
  { model: "DS425+", brand: "Synology", bays: 4, raid: ALL_RAID, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "" },
  { model: "DS925+", brand: "Synology", bays: 4, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "" },
  { model: "TS-433-4G", brand: "QNAP", bays: 4, raid: ALL_RAID, expandable: false, network: "2.5GbE ×1 + 1GbE ×1", networkUpgrade: "" },
  { model: "TS-462-4G", brand: "QNAP", bays: 4, raid: ALL_RAID, expandable: true, network: "2.5GbE ×1", networkUpgrade: "10GbE via PCIe card" },
  { model: "TS-464-8G", brand: "QNAP", bays: 4, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "10GbE via PCIe card" },
  { model: "DS1525+", brand: "Synology", bays: 5, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "10GbE via E10G22-T1-Mini module" },
  { model: "TS-664-8G", brand: "QNAP", bays: 6, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "10GbE via PCIe card" },
  { model: "DS1825+", brand: "Synology", bays: 8, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "up to 25GbE via PCIe add-in card" },
  { model: "TS-832PX-4G", brand: "QNAP", bays: 8, raid: ALL_RAID, expandable: true, network: "10GbE SFP+ ×2 + 2.5GbE ×2", networkUpgrade: "" },
  { model: "TS-873A-8G", brand: "QNAP", bays: 8, raid: ALL_RAID, expandable: true, network: "2.5GbE ×2", networkUpgrade: "5GbE/10GbE via PCIe Gen3 card" },
];

const SETTINGS = { installQuote: 5900, installMin: 4130, amcQuotePercent: 10, amcMinPercent: 7 };

async function main() {
  const payload: any = await getPayload({ config });
  let modelsCreated = 0;
  let drivesCreated = 0;

  for (const m of MODELS) {
    const found = await payload.find({ collection: "nas-models", where: { model: { equals: m.model } }, limit: 1, overrideAccess: true });
    if (found.docs.length) continue;
    const price = MODEL_PRICES[m.model];
    if (!price) throw new Error(`${m.model} has no price in nas-model-prices.ts`);
    const [quotePrice, minPrice] = price;
    await payload.create({ collection: "nas-models", data: { ...m, quotePrice, minPrice, active: true }, overrideAccess: true });
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
