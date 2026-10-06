/* The QNAP specifications that were missing or imprecise, from QNAP's own
 * hardware spec sheets (October 2026).
 *
 * Every figure already on record was checked against those sheets and matched;
 * what follows fills the blanks — USB ports and warranty were never recorded
 * for any QNAP unit — and tightens two entries:
 *
 *   TS-462-4G  the N4505 is 2 cores and 2 threads, not just "2 cores"
 *   TS-464-8G  QNAP ships this model with either an N5105 or an N5095, and
 *              lists both; naming one was a coin toss
 *
 * Synology's seven units were verified the same day against synology.com and
 * needed no change, which is why none appear here.
 *
 *   npx tsx src/seed/seed-qnap-specs.ts
 */
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

type Specs = Partial<{
  cpu: string;
  cpuCores: string;
  memory: string;
  memoryMax: string;
  usbPorts: string;
  warranty: string;
}>;

const UNITS: Record<string, Specs> = {
  "TS-233-2G": {
    usbPorts: "1 × USB 3.2 Gen 1, 2 × USB 2.0",
    warranty: "2 years",
  },
  "TS-216G-4G": {
    memoryMax: "Not upgradable",
    usbPorts: "1 × USB 3.2 Gen 1, 2 × USB 2.0",
    warranty: "2 years",
  },
  "TS-433-4G": {
    usbPorts: "1 × USB 3.2 Gen 1, 2 × USB 2.0",
    warranty: "2 years",
  },
  "TS-462-4G": {
    cpuCores: "2 cores / 2 threads, up to 2.9 GHz",
    usbPorts: "2 × USB 3.2 Gen 2 (10 Gb/s) Type-A, 2 × USB 2.0",
    warranty: "2 years",
  },
  "TS-464-8G": {
    cpu: "Intel Celeron N5105 / N5095",
    usbPorts: "2 × USB 3.2 Gen 2 (10 Gb/s) Type-A, 2 × USB 2.0",
    warranty: "3 years",
  },
  "TS-664-8G": {
    usbPorts: "2 × USB 3.2 Gen 2 (10 Gb/s) Type-A",
    warranty: "3 years",
  },
  "TS-832PX-4G": {
    warranty: "2 years",
  },
  "TS-873A-8G": {
    usbPorts: "3 × USB 3.2 Gen 2 (10 Gb/s) Type-A, 1 × USB-C 3.2 Gen 1",
    warranty: "3 years",
  },
};

async function main() {
  const payload: any = await getPayload({ config });
  const found = await payload.find({ collection: "nas-models", limit: 500, overrideAccess: true, depth: 0 });

  let updated = 0;
  let unchanged = 0;

  for (const doc of found.docs) {
    const want = UNITS[doc.model as string];
    if (!want) continue;

    const changes = Object.fromEntries(Object.entries(want).filter(([field, value]) => (doc[field] ?? "") !== value));
    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }
    await payload.update({ collection: "nas-models", id: doc.id, data: changes, overrideAccess: true });
    for (const [field, value] of Object.entries(changes)) {
      console.log(`  ~ ${String(doc.model).padEnd(12)} ${field.padEnd(10)} ${String(doc[field] || "(blank)").slice(0, 28).padEnd(30)} → ${value}`);
    }
    updated++;
  }

  console.log(`\n${updated} units corrected, ${unchanged} already current.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
