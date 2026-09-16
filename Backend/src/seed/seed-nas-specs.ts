// Fills in the detailed specifications for the NAS units already in the CMS,
// taken from the manufacturers' own spec pages (synology.com, qnap.com) in
// September 2026. Bays, network ports and expansion support were cross-checked
// against the catalogue at the same time and matched everywhere.
//
// Anything the spec page didn't state plainly is left blank on purpose — the
// configurator says "not recorded" rather than showing a figure nobody checked.
//
// Safe to re-run: it only writes the fields below, and only where they differ.
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

const SYN = (m: string) => `https://www.synology.com/en-us/products/${m}`;
const QNAP = (m: string) => `https://www.qnap.com/en-us/product/${m}/specs/hardware`;

type Specs = Record<string, string | number>;

const SPECS: Record<string, Specs> = {
  DS223J: {
    cpu: "Realtek RTD1619B",
    cpuCores: "4 cores / 4 threads, 1.7 GHz",
    memory: "1 GB DDR4 non-ECC",
    memoryMax: "Not upgradable",
    m2Slots: 0,
    usbPorts: "2 × USB 3.2 Gen 1",
    dimensions: "165 × 100 × 225.5 mm",
    weightKg: 0.88,
    warranty: "2 years, extendable to 4",
    specsUrl: SYN("DS223j"),
  },
  "DS225+": {
    cpu: "Intel Celeron J4125",
    cpuCores: "4 cores / 4 threads, 2.0–2.7 GHz",
    memory: "2 GB DDR4 non-ECC",
    memoryMax: "6 GB",
    m2Slots: 0,
    maxRawTb: 40,
    usbPorts: "2 × USB 3.2 Gen 1",
    dimensions: "165 × 108 × 232.2 mm",
    weightKg: 1.3,
    warranty: "3 years, extendable to 5",
    specsUrl: SYN("DS225+"),
  },
  "DS725+": {
    cpu: "AMD Ryzen R1600",
    cpuCores: "2 cores / 4 threads, 2.6–3.1 GHz",
    memory: "4 GB DDR4 ECC",
    memoryMax: "32 GB",
    m2Slots: 2,
    baysWithExpansion: 7,
    maxRawTb: 48,
    usbPorts: "1 × USB 3.2 Gen 1",
    dimensions: "166 × 106 × 223 mm",
    weightKg: 1.51,
    warranty: "3 years, extendable to 5",
    specsUrl: SYN("DS725+"),
  },
  "DS425+": {
    cpu: "Intel Celeron J4125",
    cpuCores: "4 cores / 4 threads, 2.0–2.7 GHz",
    memory: "2 GB DDR4",
    memoryMax: "6 GB",
    m2Slots: 2,
    maxRawTb: 96,
    usbPorts: "2 × USB 3.2 Gen 1",
    dimensions: "166 × 199 × 223 mm",
    weightKg: 2.18,
    warranty: "3 years, extendable to 5",
    specsUrl: SYN("DS425+"),
  },
  "DS925+": {
    cpu: "AMD Ryzen V1500B",
    cpuCores: "4 cores / 8 threads, 2.2 GHz",
    memory: "4 GB DDR4 ECC",
    memoryMax: "32 GB",
    m2Slots: 2,
    baysWithExpansion: 9,
    usbPorts: "2 × USB 3.2 Gen 1",
    dimensions: "166 × 199 × 223 mm",
    weightKg: 2.26,
    warranty: "3 years, extendable to 5",
    specsUrl: SYN("DS925+"),
  },
  "DS1525+": {
    cpu: "AMD Ryzen V1500B",
    cpuCores: "4 cores / 8 threads, 2.2 GHz",
    memory: "8 GB DDR4 ECC",
    memoryMax: "32 GB",
    m2Slots: 2,
    baysWithExpansion: 15,
    usbPorts: "2 × USB 3.2 Gen 1",
    dimensions: "166 × 230 × 223 mm",
    weightKg: 2.67,
    warranty: "3 years, extendable to 5",
    specsUrl: SYN("DS1525+"),
  },
  "DS1825+": {
    cpu: "AMD Ryzen V1500B",
    cpuCores: "4 cores / 8 threads, 2.2 GHz",
    memory: "8 GB DDR4 ECC",
    memoryMax: "32 GB",
    m2Slots: 2,
    baysWithExpansion: 18,
    maxRawTb: 160,
    usbPorts: "3 × USB 3.2 Gen 1",
    dimensions: "166 × 343 × 243 mm",
    weightKg: 6,
    warranty: "3 years, extendable to 5",
    specsUrl: SYN("DS1825+"),
  },

  "TS-233-2G": {
    cpu: "ARM Cortex-A55",
    cpuCores: "4 cores, 2.0 GHz",
    memory: "2 GB (on board)",
    memoryMax: "Not upgradable",
    m2Slots: 0,
    usbPorts: "1 × USB 3.2 Gen 1, 2 × USB 2.0",
    warranty: "2 years, extendable to 5",
    specsUrl: QNAP("ts-233"),
  },
  "TS-216G-4G": {
    cpu: "ARM Cortex-A55",
    cpuCores: "4 cores, 2.0 GHz",
    memory: "4 GB",
    m2Slots: 0,
    usbPorts: "1 × USB 3.2 Gen 1, 2 × USB 2.0",
    warranty: "2 years, extendable to 5",
    specsUrl: QNAP("ts-216g"),
  },
  "TS-433-4G": {
    cpu: "ARM Cortex-A55",
    cpuCores: "4 cores, 2.0 GHz",
    memory: "4 GB (on board)",
    memoryMax: "Not upgradable",
    m2Slots: 0,
    usbPorts: "1 × USB 3.2 Gen 1, 2 × USB 2.0",
    specsUrl: QNAP("ts-433"),
  },
  "TS-462-4G": {
    cpu: "Intel Celeron N4505",
    cpuCores: "2 cores, up to 2.9 GHz",
    memory: "4 GB DDR4",
    memoryMax: "16 GB",
    m2Slots: 2,
    specsUrl: QNAP("ts-462"),
  },
  "TS-464-8G": {
    cpu: "Intel Celeron N5105",
    cpuCores: "4 cores / 4 threads, up to 2.9 GHz",
    memory: "8 GB DDR4",
    memoryMax: "16 GB",
    m2Slots: 2,
    specsUrl: QNAP("ts-464"),
  },
  "TS-664-8G": {
    cpu: "Intel Celeron N5095",
    cpuCores: "4 cores / 4 threads, up to 2.9 GHz",
    memory: "8 GB DDR4",
    memoryMax: "16 GB",
    m2Slots: 2,
    maxRawTb: 120,
    specsUrl: QNAP("ts-664"),
  },
  "TS-832PX-4G": {
    cpu: "Annapurna Labs AL-324",
    cpuCores: "4 cores, 1.7 GHz",
    memory: "4 GB DDR4",
    memoryMax: "16 GB",
    m2Slots: 0,
    specsUrl: QNAP("ts-832px"),
  },
  "TS-873A-8G": {
    cpu: "AMD Ryzen Embedded V1500B",
    cpuCores: "4 cores / 8 threads, 2.2 GHz",
    memory: "8 GB DDR4",
    memoryMax: "64 GB",
    m2Slots: 2,
    specsUrl: QNAP("ts-873a"),
  },
};

async function main() {
  const payload: any = await getPayload({ config });
  let updated = 0;
  let unchanged = 0;
  const missing: string[] = [];

  for (const [model, specs] of Object.entries(SPECS)) {
    const found = await payload.find({ collection: "nas-models", where: { model: { equals: model } }, limit: 1, overrideAccess: true });
    const doc = found.docs[0];
    if (!doc) {
      missing.push(model);
      continue;
    }

    const changes = Object.fromEntries(Object.entries(specs).filter(([k, v]) => doc[k] !== v));
    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }
    await payload.update({ collection: "nas-models", id: doc.id, data: changes, overrideAccess: true });
    updated++;
  }

  console.log(`Specifications: ${updated} units updated, ${unchanged} already current`);
  if (missing.length) console.log(`Not in the CMS (skipped): ${missing.join(", ")}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
