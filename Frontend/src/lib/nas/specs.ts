import { RAID_INFO, inr } from "./logic";
import type { Build, DriveLine, NasModel, RaidLevel } from "./types";

/* The specification of a unit, and of the configuration built on it, as
 * label/value pairs — one source for the hover card, the full specifications
 * dialog and the comparison table, so the three can't disagree.
 *
 * Only what the price list records, which is what the manufacturer's own spec
 * page says. A specification nobody filled in is left out rather than guessed:
 * these figures go in front of customers. */

export type Spec = { label: string; value: string };

const raidList = (model: NasModel) => model.raid.map((r) => RAID_INFO[r].title).join(", ");

const row = (label: string, value: string | number | null | undefined): Spec | null =>
  value == null || value === "" ? null : { label, value: String(value) };

/** The unit itself, independent of what's configured on it. */
export function modelSpecs(model: NasModel): Spec[] {
  return [
    row("Brand", model.brand),
    row("Drive bays", model.bays),
    row("Bays with expansion", model.baysWithExpansion),
    row("Processor", model.cpu),
    row("Cores", model.cpuCores),
    row("Memory", model.memory),
    row("Maximum memory", model.memoryMax),
    row("M.2 NVMe slots", model.m2Slots == null ? null : model.m2Slots || "None"),
    row("Largest drive supported", model.maxDriveTb ? `${model.maxDriveTb} TB` : null),
    row("RAID levels", raidList(model) || "—"),
    row("Network ports", model.network || "Not recorded"),
    row("Network upgrade", model.networkUpgrade || "None"),
    row("USB ports", model.usbPorts),
    row("Expansion unit", model.expandable ? "Supported" : "Not supported"),
    row("Maximum raw capacity", model.maxRawTb ? `${model.maxRawTb} TB` : null),
    row("Dimensions", model.dimensions),
    row("Weight", model.weightKg ? `${model.weightKg} kg` : null),
    row("Warranty", model.warranty),
    row("Price per unit", inr(model.quote)),
  ].filter((s): s is Spec => s !== null);
}

/** The few that decide a shortlist — for the hover card on the ⓘ. */
const KEY_LABELS = ["Drive bays", "Processor", "Memory", "Network ports", "Expansion unit"];

export function keySpecs(model: NasModel): Spec[] {
  const all = modelSpecs(model);
  const picked = KEY_LABELS.map((label) => all.find((s) => s.label === label)).filter((s): s is Spec => s != null);
  // A unit with almost nothing recorded still gets a useful card.
  return picked.length >= 3 ? picked : all.filter((s) => s.label !== "Brand").slice(0, 5);
}

/* ---------------- drives ---------------- */

export const findLine = (lines: DriveLine[], name: string): DriveLine | undefined =>
  lines.find((l) => l.name.toLowerCase() === name.trim().toLowerCase());

const CLASS_LABEL: Record<DriveLine["driveClass"], string> = { nas: "NAS", enterprise: "Enterprise" };

/** Everything recorded about a drive family. */
export function driveLineSpecs(line: DriveLine): Spec[] {
  return [
    row("Made by", line.brand),
    row("Class", CLASS_LABEL[line.driveClass]),
    row("Series", line.series),
    row("Spindle speed", line.rpm),
    row("Cache", line.cache),
    row("Interface", line.interface),
    row("Recording", line.recording),
    row("Workload rating", line.workloadTbYear),
    row("MTBF", line.mtbf),
    row("Warranty", line.warrantyYears ? `${line.warrantyYears} years` : null),
    row("Included", line.extras),
  ].filter((s): s is Spec => s !== null);
}

/** The few that decide a drive — for the hover card on the ⓘ. */
const DRIVE_KEY_LABELS = ["Class", "Spindle speed", "Workload rating", "MTBF", "Warranty"];

export function keyDriveSpecs(line: DriveLine): Spec[] {
  const all = driveLineSpecs(line);
  const picked = DRIVE_KEY_LABELS.map((label) => all.find((s) => s.label === label)).filter((s): s is Spec => s != null);
  return picked.length >= 3 ? picked : all.slice(0, 5);
}

/** The workload rating as a number of TB/year, read out of whatever the CMS
 *  holds ("Up to 180 TB/year" → 180). Unparseable text yields null, and every
 *  rule that uses it then stays quiet rather than guessing. */
function workloadTb(line: DriveLine): number | null {
  const m = line.workloadTbYear.match(/(\d[\d,]*)\s*TB/i);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

export type DriveNote = { tone: "warn" | "info"; text: string };

/* What's worth saying about putting this drive family in this unit.
 *
 * Only what the catalogue actually records — the drive's maker, its class and
 * its workload rating against the unit's brand and bay count. Nothing here
 * blocks a configuration: every combination we price is one that runs. These
 * are the things a customer would otherwise find out after buying. */
export function driveNotes(model: NasModel, line: DriveLine, drivesPerUnit: number): DriveNote[] {
  const notes: DriveNote[] = [];
  const madeFor = line.madeForBrand.trim();

  if (madeFor && madeFor.toLowerCase() !== model.brand.toLowerCase()) {
    notes.push({
      tone: "warn",
      text: `${line.name} drives are built and validated for ${madeFor} units. In a ${model.brand} unit they run as ordinary SATA drives, without the health reporting ${madeFor} adds — a ${model.brand}-validated drive is the safer choice.`,
    });
  } else if (madeFor) {
    notes.push({
      tone: "info",
      text: `Validated by ${madeFor} for this unit, with drive health and firmware updates handled inside ${madeFor}'s own software.`,
    });
  } else if (model.brand.toLowerCase() === "synology") {
    notes.push({
      tone: "info",
      text: `Synology validates its own drives for this unit. ${line.name} drives are supported and widely used, but Synology's software reports less detail about their health, and its support team may ask you to reproduce a fault on a validated drive.`,
    });
  }

  const workload = workloadTb(line);
  if (workload != null && workload < 300 && drivesPerUnit > 8) {
    notes.push({
      tone: "warn",
      text: `${line.name} is rated for ${workload} TB of reads and writes a year. An array this size is usually busier than that — ${line.driveClass === "nas" ? "a Pro or enterprise drive" : "a higher-rated drive"} is rated for the load and carries a longer warranty.`,
    });
  }

  if (line.driveClass === "enterprise" && drivesPerUnit <= 2) {
    notes.push({
      tone: "info",
      text: `Enterprise drives spin at 7,200 rpm and are built for constant use. In a desk-side unit they're noticeably louder than a NAS drive — worth it if the unit runs around the clock.`,
    });
  }

  if (model.maxDriveTb) {
    notes.push({ tone: "info", text: `This unit takes drives up to ${model.maxDriveTb} TB each, so only those sizes are quoted for it.` });
  }

  return notes;
}

/** This configuration on that unit. */
export function buildSpecs(build: Build, raid: RaidLevel): Spec[] {
  return [
    { label: "Usable capacity", value: `${build.totalUsable} TB` },
    { label: "RAID level", value: RAID_INFO[raid].title },
    { label: "Drives", value: `${build.drivesPerUnit * build.units} × ${build.driveCap} TB ${build.driveLine}` },
    { label: "Bays used", value: `${build.drivesPerUnit} of ${build.model.bays} per unit` },
    { label: "Units", value: `${build.units}` },
    { label: "Spare bays", value: `${build.spareBays}` },
    { label: "Unit + drives", value: inr(build.totalQuote) },
  ];
}

/** One row per specification, one column per shortlisted unit. Every row is
 *  filled for every column — a blank cell would read as a missing feature. */
export function compareRows(builds: Build[], raid: RaidLevel): { label: string; values: string[] }[] {
  const rows: { label: string; get: (b: Build) => string }[] = [
    { label: "Brand", get: (b) => b.model.brand },
    { label: "Drive bays", get: (b) => `${b.model.bays}` },
    { label: "Processor", get: (b) => b.model.cpu || "Not recorded" },
    { label: "Cores", get: (b) => b.model.cpuCores || "Not recorded" },
    { label: "Memory", get: (b) => b.model.memory || "Not recorded" },
    { label: "Maximum memory", get: (b) => b.model.memoryMax || "Not recorded" },
    { label: "M.2 NVMe slots", get: (b) => (b.model.m2Slots == null ? "Not recorded" : b.model.m2Slots ? `${b.model.m2Slots}` : "None") },
    { label: "Largest drive supported", get: (b) => (b.model.maxDriveTb ? `${b.model.maxDriveTb} TB` : "Not recorded") },
    { label: "Usable capacity", get: (b) => `${b.totalUsable} TB` },
    { label: "Drives", get: (b) => `${b.drivesPerUnit * b.units} × ${b.driveCap} TB ${b.driveLine}` },
    { label: "Units", get: (b) => `${b.units}` },
    { label: "Spare bays", get: (b) => `${b.spareBays}` },
    { label: "RAID level", get: () => RAID_INFO[raid].title },
    { label: "RAID supported", get: (b) => raidList(b.model) || "—" },
    { label: "Network ports", get: (b) => b.model.network || "Not recorded" },
    { label: "Network upgrade", get: (b) => b.model.networkUpgrade || "None" },
    { label: "USB ports", get: (b) => b.model.usbPorts || "Not recorded" },
    { label: "Expansion unit", get: (b) => (b.model.expandable ? `Supported${b.model.baysWithExpansion ? ` — up to ${b.model.baysWithExpansion} bays` : ""}` : "Not supported") },
    { label: "Warranty", get: (b) => b.model.warranty || "Not recorded" },
    { label: "Unit + drives", get: (b) => inr(b.totalQuote) },
  ];
  return rows.map((r) => ({ label: r.label, values: builds.map(r.get) }));
}
