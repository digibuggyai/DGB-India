// The specifications of each hard drive family the configurator can quote,
// taken from the manufacturers' own pages and datasheets in September 2026.
//
// Lines are listed here whether or not they're currently stocked: the specs
// are ready the moment prices are added for them.
//
// Safe to re-run: it updates the fields below and leaves anything else alone.
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

type Line = Record<string, string | number>;

const LINES: Line[] = [
  {
    name: "IronWolf",
    brand: "Seagate",
    driveClass: "nas",
    series: "IronWolf",
    rpm: "5,400–7,200 rpm (by capacity)",
    cache: "64–256 MB (by capacity)",
    interface: "SATA 6 Gb/s",
    recording: "CMR",
    workloadTbYear: "180 TB/year",
    mtbf: "1 million hours",
    warrantyYears: 3,
    bestFor: "Small NAS units in an office or studio — Seagate rates them for 1- to 8-bay systems and light to moderate daily use.",
    extras: "3 years Rescue Data Recovery included",
    specsUrl: "https://www.seagate.com/in/en/products/nas-drives/ironwolf-hard-drive/",
    sortOrder: 20,
  },
  {
    name: "IronWolf Pro",
    brand: "Seagate",
    driveClass: "nas",
    series: "IronWolf Pro",
    rpm: "7,200 rpm",
    cache: "256 MB (512 MB on the largest capacities)",
    interface: "SATA 6 Gb/s",
    recording: "CMR",
    // The 24 TB and larger drives are rated far higher than the rest of the
    // line — Seagate's 24 TB datasheet, not the older 20 TB one.
    workloadTbYear: "300 TB/year (550 TB/year on 24 TB and larger)",
    mtbf: "1.2 million hours (2.5 million on 24 TB and larger)",
    warrantyYears: 5,
    bestFor: "Busy multi-bay NAS units shared by a whole team, and larger arrays.",
    extras: "3 years Rescue Data Recovery included",
    specsUrl: "https://www.seagate.com/in/en/products/nas-drives/ironwolf-pro-hard-drive/",
    sortOrder: 30,
  },
  {
    name: "Exos",
    brand: "Seagate",
    driveClass: "enterprise",
    series: "Exos X",
    rpm: "7,200 rpm",
    cache: "256 MB (512 MB on 24 TB)",
    interface: "SATA 6 Gb/s (SAS available)",
    recording: "CMR",
    workloadTbYear: "550 TB/year",
    mtbf: "2.5 million hours",
    warrantyYears: 5,
    bestFor: "Constant, heavy use — the drives data centres run around the clock.",
    specsUrl: "https://www.seagate.com/in/en/products/enterprise-drives/exos-x/",
    sortOrder: 40,
  },
  {
    name: "WD Ultrastar",
    brand: "Western Digital",
    driveClass: "enterprise",
    series: "Ultrastar DC HC500 series (HC560 / HC580)",
    rpm: "7,200 rpm",
    cache: "512 MB",
    interface: "SATA 6 Gb/s (SAS available)",
    recording: "CMR",
    workloadTbYear: "550 TB/year",
    mtbf: "Up to 2.5 million hours (projected)",
    warrantyYears: 5,
    bestFor: "Constant, heavy use, and the largest capacities we stock.",
    specsUrl: "https://www.westerndigital.com/products/internal-drives/data-center-drives/ultrastar-dc-hc580-hdd",
    sortOrder: 50,
  },
  {
    name: "Synology Plus",
    brand: "Synology",
    madeForBrand: "Synology",
    driveClass: "nas",
    series: "HAT3300 / HAT3310 / HAT3320",
    rpm: "5,400 rpm (2–6 TB), 7,200 rpm (8–20 TB)",
    interface: "SATA 6 Gb/s",
    recording: "CMR",
    workloadTbYear: "180 TB/year (up to 300 TB/year on the larger models)",
    mtbf: "Up to 1.2 million hours",
    warrantyYears: 3,
    bestFor: "Synology DiskStations — tuned by Synology for its own units.",
    extras: "Validated by Synology; health data reported in DSM",
    specsUrl: "https://www.synology.com/en-us/products/drives/hdd/plus-hat",
    sortOrder: 60,
  },
  {
    name: "Synology Enterprise",
    brand: "Synology",
    madeForBrand: "Synology",
    driveClass: "enterprise",
    series: "HAT5300 / HAT5310 / HAT5320",
    rpm: "7,200 rpm",
    interface: "SATA 6 Gb/s",
    recording: "CMR",
    workloadTbYear: "550 TB/year",
    mtbf: "Up to 2.5 million hours",
    warrantyYears: 5,
    bestFor: "Synology units under constant load, and the 24 TB drives Synology sells.",
    extras: "Validated by Synology; health data reported in DSM",
    specsUrl: "https://www.synology.com/en-us/products/drives/hdd/enterprise-hat",
    sortOrder: 70,
  },
];

async function main() {
  const payload: any = await getPayload({ config });
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const line of LINES) {
    const found = await payload.find({ collection: "nas-drive-lines", where: { name: { equals: line.name } }, limit: 1, overrideAccess: true });
    const doc = found.docs[0];
    if (!doc) {
      await payload.create({ collection: "nas-drive-lines", data: line, overrideAccess: true });
      console.log(`  + ${line.name}`);
      created++;
      continue;
    }
    const changes = Object.fromEntries(Object.entries(line).filter(([k, v]) => doc[k] !== v));
    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }
    await payload.update({ collection: "nas-drive-lines", id: doc.id, data: changes, overrideAccess: true });
    console.log(`  ~ ${line.name}: ${Object.keys(changes).join(", ")}`);
    updated++;
  }

  const stocked = await payload.find({ collection: "nas-drives", limit: 500, overrideAccess: true, depth: 0 });
  const names = new Set(LINES.map((l) => l.name));
  const missing = [...new Set(stocked.docs.map((d: any) => d.line))].filter((l) => !names.has(l as string));

  console.log(`\nDrive lines: ${created} added, ${updated} updated, ${unchanged} already current.`);
  if (missing.length) console.log(`Priced drives with no specs on record: ${missing.join(", ")}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
