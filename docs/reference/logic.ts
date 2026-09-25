/* COPY — do not edit here.
 *
 * Taken from Frontend/src/lib/nas/logic.ts by Frontend/scripts/update-spec.ts,
 * so that docs/nas-configurator-spec.md ships the engine it describes.
 * Edit the original and re-run the script.
 */
/* Sizing and recommendation engine for the NAS configurator.
 *
 * A port of the DigiBuggy sales tool's frontend/src/logic.js — the same pure
 * functions, the same search, the same ordering — with one deliberate change:
 * every minimum-price calculation is gone. Nothing here touches the DOM, so it
 * can be checked against the original on its own. */

import type { Build, HddPricing, NasModel, RaidLevel } from "./types";

type RaidInfo = {
  minDrives: number;
  step: number;
  title: string;
  sub: string;
  label: string;
};

export const RAID_LEVELS: RaidLevel[] = ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"];

export const RAID_INFO: Record<RaidLevel, RaidInfo> = {
  // RAID 0 stripes across drives, so it takes at least two: one drive is a
  // plain single-disk volume ("Basic"), not an array. The sales tool this was
  // ported from allowed one, which quoted things like "1× 4 TB at RAID 0" in a
  // 2-bay unit.
  RAID0: { minDrives: 2, step: 1, title: "RAID 0", sub: "Striping · no redundancy", label: "RAID 0 — striping (full capacity, zero redundancy)" },
  RAID1: { minDrives: 2, step: 1, title: "RAID 1", sub: "Mirrored · 50% usable", label: "RAID 1 — mirroring (50% usable, survives 1 drive failure)" },
  RAID5: { minDrives: 3, step: 1, title: "RAID 5", sub: "Parity · survives 1 failure", label: "RAID 5 — parity (survives 1 drive failure)" },
  RAID6: { minDrives: 4, step: 1, title: "RAID 6", sub: "Dual parity · survives 2", label: "RAID 6 — dual parity (survives 2 drive failures)" },
  RAID10: { minDrives: 4, step: 2, title: "RAID 10", sub: "Mirror + stripe · fast rebuild", label: "RAID 10 — mirror + stripe (50% usable, fastest rebuild)" },
};

export const MAX_BAYS = 8;
/** How many chassis the tool will gang together before calling a target unbuildable. */
export const MAX_UNITS = 4;
export const STORAGE_MIN = 2;
export const STORAGE_MAX = 200;

/** Most to least redundant — see suggestBudgetPlan for why this order matters. */
export const RAID_REDUNDANCY_ORDER: RaidLevel[] = ["RAID6", "RAID10", "RAID5", "RAID1", "RAID0"];

export function inr(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** Usable TB for `n` drives of `driveTB` each at the given RAID level. */
export function usableForN(raid: RaidLevel, n: number, driveTB: number): number {
  switch (raid) {
    case "RAID0":
      return n * driveTB;
    case "RAID1":
      return driveTB;
    case "RAID5":
      return (n - 1) * driveTB;
    case "RAID6":
      return (n - 2) * driveTB;
    case "RAID10":
      return (n / 2) * driveTB;
    default:
      return 0;
  }
}

type DriveCalc = { drivesPerUnit: number; units: number; totalUsable: number };

/** Smallest drive count (and chassis count) that reaches targetTB usable. If one
 *  chassis can't get there at this drive size, the target spreads across whole
 *  units. */
export function computeDrives(raid: RaidLevel, driveTB: number, targetTB: number, maxBays = MAX_BAYS): DriveCalc {
  const info = RAID_INFO[raid];
  if (!(maxBays >= 2)) throw new Error("maxBays must be at least 2");

  // The chassis can't host this array at all — RAID 5 needs three bays, RAID 6
  // and RAID 10 need four. Infinite units keeps it out of every search, which
  // filter on unit count.
  if (maxBays < info.minDrives) return { drivesPerUnit: 0, units: Infinity, totalUsable: 0 };

  if (raid === "RAID1") {
    const usable = usableForN(raid, 2, driveTB);
    const units = Math.max(1, Math.ceil(targetTB / usable));
    return { drivesPerUnit: 2, units, totalUsable: usable * units };
  }

  for (let n = info.minDrives; n <= maxBays; n += info.step) {
    const usable = usableForN(raid, n, driveTB);
    if (usable >= targetTB) return { drivesPerUnit: n, units: 1, totalUsable: usable };
  }

  // The chassis can't reach the target on its own: fill it and add more units.
  // RAID 10 fills in pairs, so an odd bay count leaves the last bay empty.
  const fullest = info.step === 2 ? maxBays - (maxBays % 2) : maxBays;
  const usableMax = usableForN(raid, fullest, driveTB);
  const units = Math.ceil(targetTB / usableMax);
  return { drivesPerUnit: fullest, units, totalUsable: usableMax * units };
}

type Filters = {
  brand?: string;
  bays?: number | null;
  expandableOnly?: boolean;
};

/** Money spent on top of the hardware — installation, AMC — for a build of this
 *  hardware value and unit count. */
export type ExtraCost = (hardware: number, units: number) => number;

type Catalogue = {
  models: NasModel[];
  hddPricing: HddPricing;
  capacities: number[];
  maxUnits?: number;
};

/** A unit only takes drives up to its own per-drive ceiling. No ceiling on
 *  record means no restriction — the catalogue decides. */
function fitsDrive(model: NasModel, cap: number): boolean {
  return !model.maxDriveTb || cap <= model.maxDriveTb;
}

function modelMatches(model: NasModel, raid: RaidLevel, { brand = "any", bays = null, expandableOnly = false }: Filters): boolean {
  if (!model.raid.includes(raid)) return false;
  // Belt and braces: the catalogue shouldn't list a RAID level a chassis has
  // too few bays for, but if it ever does, don't quote it.
  if (model.bays < RAID_INFO[raid].minDrives) return false;
  if (brand !== "any" && model.brand.toLowerCase() !== brand.toLowerCase()) return false;
  if (bays != null && model.bays !== Number(bays)) return false;
  if (expandableOnly && !model.expandable) return false;
  return true;
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
}

/** Drive lines priced at a capacity. */
export function linesForCapacity(hddPricing: HddPricing, cap: number): string[] {
  return Object.keys(hddPricing[cap] || {});
}

/**
 * Every way of hitting a capacity target, cheapest first. A model qualifies when
 * it has at least the bays the array needs, so a 6-bay unit is a legitimate home
 * for a 4-drive array — with expansion room.
 */
export function suggestBuilds({
  targetTB,
  raid,
  models,
  hddPricing,
  capacities,
  maxUnits = MAX_UNITS,
  ...filters
}: Catalogue & Filters & { targetTB: number; raid: RaidLevel }): Build[] {
  const builds: Build[] = [];

  for (const model of models) {
    if (!modelMatches(model, raid, filters)) continue;

    for (const cap of capacities) {
      if (!fitsDrive(model, cap)) continue;
      const lines = hddPricing[cap] || {};
      for (const line of Object.keys(lines)) {
        const drive = lines[line];
        const calc = computeDrives(raid, cap, targetTB, model.bays);
        if (calc.units > maxUnits) continue;

        const drives = calc.drivesPerUnit * calc.units;
        builds.push({
          model,
          driveCap: cap,
          driveLine: line,
          drivesPerUnit: calc.drivesPerUnit,
          units: calc.units,
          totalUsable: calc.totalUsable,
          spareBays: (model.bays - calc.drivesPerUnit) * calc.units,
          totalQuote: model.quote * calc.units + drive.quote * drives,
        });
      }
    }
  }

  // Cheapest first; then fewer boxes; then less over-delivery.
  builds.sort((a, b) => a.totalQuote - b.totalQuote || a.units - b.units || a.totalUsable - b.totalUsable);
  return builds;
}

/** The best build per model, so the list offers real alternatives rather than
 *  the same unit five times with different drives. */
export function bestBuildPerModel(builds: Build[]): Build[] {
  const seen = new Map<string, Build>();
  for (const b of builds) {
    if (!seen.has(b.model.id)) seen.set(b.model.id, b);
  }
  return [...seen.values()];
}

/* ---------------- network speed ---------------- */

/** The highest speed named in a ports string, in Gb/s. */
export function topSpeed(spec: string | null | undefined): number {
  const hits = String(spec || "").match(/(\d+(?:\.\d+)?)\s*GbE/gi);
  if (!hits) return 0;
  return Math.max(...hits.map((h) => parseFloat(h)));
}

/** Rounds a raw Gb figure onto the speeds a quotation talks in. */
export function labelForSpeed(gb: number): string | null {
  if (gb >= 10) return "10GbE";
  if (gb >= 2.5) return "2.5GbE";
  if (gb >= 1) return "1GbE";
  return null;
}

export type NetworkInfo = {
  builtIn: string | null;
  upgrade: string | null;
  topGb: number;
  /** The fastest link the unit has out of the box, as a quotable label. */
  quotable: string | null;
};

export function networkFor(model: NasModel | null | undefined): NetworkInfo | null {
  if (!model) return null;
  const builtIn = (model.network || "").trim();
  const upgrade = (model.networkUpgrade || "").trim();
  if (!builtIn && !upgrade) return null;
  return {
    builtIn: builtIn || null,
    upgrade: upgrade || null,
    topGb: topSpeed(builtIn),
    quotable: builtIn ? labelForSpeed(topSpeed(builtIn)) : null,
  };
}

/** The best network the current shortlist could reach. */
export function bestNetworkAmong(builds: Build[]): (NetworkInfo & { model: NasModel }) | null {
  let best: (NetworkInfo & { model: NasModel }) | null = null;
  for (const b of builds) {
    const net = networkFor(b.model);
    if (net && (!best || net.topGb > best.topGb)) best = { ...net, model: b.model };
  }
  return best;
}

/* ---------------- buildable sizes ---------------- */

/**
 * The usable capacities that can actually be built, exactly, from the drives and
 * chassis priced. A NAS delivers whole drives at a RAID level, so capacity lands
 * on discrete values — offering those beats letting someone type a figure no
 * combination produces.
 */
export function buildableSizes({
  raid,
  models,
  capacities,
  hddPricing,
  maxUnits = MAX_UNITS,
  max = STORAGE_MAX,
  min = STORAGE_MIN,
  ...filters
}: Catalogue & Filters & { raid: RaidLevel; max?: number; min?: number }): number[] {
  const info = RAID_INFO[raid];
  const sizes = new Set<number>();

  for (const model of models) {
    if (!modelMatches(model, raid, filters)) continue;

    for (const cap of capacities) {
      if (!fitsDrive(model, cap) || !Object.keys(hddPricing[cap] || {}).length) continue;

      // RAID 1 is always a single mirrored pair, whatever the chassis holds.
      const counts = raid === "RAID1" ? [2] : range(info.minDrives, model.bays, info.step);

      for (const n of counts) {
        const perUnit = usableForN(raid, n, cap);
        for (let units = 1; units <= maxUnits; units++) {
          const total = perUnit * units;
          if (total >= min && total <= max && Number.isInteger(total)) sizes.add(total);
        }
      }
    }
  }
  return [...sizes].sort((a, b) => a - b);
}

/** The offered size closest to what was asked for, preferring not to under-deliver. */
export function nearestBuildable(targetTB: number, sizes: number[]): number | null {
  if (!sizes.length) return null;
  const atOrAbove = sizes.find((s) => s >= targetTB);
  if (atOrAbove == null) return sizes[sizes.length - 1];
  const below = [...sizes].reverse().find((s) => s < targetTB);
  if (below == null) return atOrAbove;
  return atOrAbove - targetTB <= targetTB - below ? atOrAbove : below;
}

/* ---------------- sizing by budget ---------------- */

/** Every build at a fixed RAID level that fits a budget, most usable capacity first. */
export function suggestBuildsForBudget({
  budget,
  raid,
  models,
  hddPricing,
  capacities,
  maxUnits = MAX_UNITS,
  extraCost,
  ...filters
}: Catalogue & Filters & { budget: number; raid: RaidLevel; extraCost?: ExtraCost }): Build[] {
  const info = RAID_INFO[raid];
  if (!(budget > 0)) return [];

  const builds: Build[] = [];

  for (const model of models) {
    if (!modelMatches(model, raid, filters)) continue;

    for (const cap of capacities) {
      if (!fitsDrive(model, cap)) continue;
      const lines = hddPricing[cap] || {};
      for (const line of Object.keys(lines)) {
        const drive = lines[line];
        const counts = raid === "RAID1" ? [2] : range(info.minDrives, model.bays, info.step);

        for (const n of counts) {
          const perUnitUsable = usableForN(raid, n, cap);
          if (!(perUnitUsable > 0)) continue;
          const perUnitQuote = model.quote + drive.quote * n;

          // Each added unit only costs more, so once one breaks the budget
          // every larger unit count will too.
          for (let units = 1; units <= maxUnits; units++) {
            const totalQuote = perUnitQuote * units;
            // What the customer actually pays: hardware plus anything they've
            // asked for on top, so a budget means the whole quote.
            if (totalQuote + (extraCost ? extraCost(totalQuote, units) : 0) > budget) break;
            builds.push({
              model,
              driveCap: cap,
              driveLine: line,
              drivesPerUnit: n,
              units,
              totalUsable: perUnitUsable * units,
              spareBays: (model.bays - n) * units,
              totalQuote,
            });
          }
        }
      }
    }
  }

  // Most storage for the money first; then cheaper; then fewer boxes.
  builds.sort((a, b) => b.totalUsable - a.totalUsable || a.totalQuote - b.totalQuote || a.units - b.units);
  return builds;
}

/**
 * The RAID level to default a budget-driven build to, and the ranked builds at it.
 *
 * Maximising raw capacity across every level always lands on RAID 0 — zero fault
 * tolerance — however generous the budget. So redundancy is kept unless the
 * budget genuinely can't afford it: levels are tried most-protective first, and
 * the first with any build that fits is used.
 */
export function suggestBudgetPlan({
  budget,
  raidPool = RAID_REDUNDANCY_ORDER,
  ...rest
}: Catalogue & Filters & { budget: number; raidPool?: RaidLevel[]; extraCost?: ExtraCost }): { raid: RaidLevel; builds: Build[] } | null {
  // Among the levels that survive a drive failure, take the one that turns the
  // budget into the most usable space. Trying them most-protective-first and
  // stopping at the first that fits sounds safer but spends the budget badly:
  // RAID 6 hands a second drive to parity, so at the same money it routinely
  // delivers far less than RAID 5 — often a third less on the same chassis.
  // (Worked figures live in docs/nas-configurator-spec.md, which is generated
  // from the live price list; putting them here only makes them go stale.)
  // Ties go to the more protective level, which is what the pool order gives.
  let best: { raid: RaidLevel; builds: Build[]; usable: number } | null = null;
  for (const raid of raidPool) {
    if (raid === "RAID0") continue;
    const builds = suggestBuildsForBudget({ ...rest, budget, raid });
    if (!builds.length) continue;
    const usable = builds[0].totalUsable;
    if (!best || usable > best.usable) best = { raid, builds, usable };
  }
  if (best) return { raid: best.raid, builds: best.builds };

  // Nothing redundant is affordable. RAID 0 still beats telling someone their
  // budget buys nothing, and the configurator says plainly that it has no
  // redundancy.
  if (raidPool.includes("RAID0")) {
    const builds = suggestBuildsForBudget({ ...rest, budget, raid: "RAID0" });
    if (builds.length) return { raid: "RAID0", builds };
  }
  return null;
}

/** The least anything on the price list can be built for, so a budget that is
 *  too small can say what would be enough instead of only "nothing fits". */
export function cheapestOutlay({
  raidPool = RAID_REDUNDANCY_ORDER,
  extraCost,
  ...rest
}: Catalogue & Filters & { raidPool?: RaidLevel[]; extraCost?: ExtraCost }): number | null {
  let cheapest: number | null = null;
  for (const raid of raidPool) {
    for (const b of suggestBuildsForBudget({ ...rest, budget: Number.MAX_SAFE_INTEGER, raid, extraCost })) {
      const outlay = b.totalQuote + (extraCost ? extraCost(b.totalQuote, b.units) : 0);
      if (cheapest == null || outlay < cheapest) cheapest = outlay;
    }
  }
  return cheapest;
}
