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
  RAID0: { minDrives: 2, step: 1, title: "RAID 0", sub: "Striping · no redundancy", label: "RAID 0 — striping (full capacity, zero redundancy)" },
  RAID1: { minDrives: 2, step: 1, title: "RAID 1", sub: "Mirrored · 50% usable", label: "RAID 1 — mirroring (50% usable, survives 1 drive failure)" },
  RAID5: { minDrives: 3, step: 1, title: "RAID 5", sub: "Parity · survives 1 failure", label: "RAID 5 — parity (survives 1 drive failure)" },
  RAID6: { minDrives: 4, step: 1, title: "RAID 6", sub: "Dual parity · survives 2", label: "RAID 6 — dual parity (survives 2 drive failures)" },
  RAID10: { minDrives: 4, step: 2, title: "RAID 10", sub: "Mirror + stripe · fast rebuild", label: "RAID 10 — mirror + stripe (50% usable, fastest rebuild)" },
};

export const MAX_BAYS = 8;
export const MAX_UNITS = 4;
export const STORAGE_MIN = 2;
export const STORAGE_MAX = 200;

export const RAID_REDUNDANCY_ORDER: RaidLevel[] = ["RAID6", "RAID10", "RAID5", "RAID1", "RAID0"];

export function inr(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

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

export function computeDrives(raid: RaidLevel, driveTB: number, targetTB: number, maxBays = MAX_BAYS): DriveCalc {
  const info = RAID_INFO[raid];
  if (!(maxBays >= 2)) throw new Error("maxBays must be at least 2");

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

export type ExtraCost = (hardware: number, units: number) => number;

type Catalogue = {
  models: NasModel[];
  hddPricing: HddPricing;
  capacities: number[];
  maxUnits?: number;
};

function fitsDrive(model: NasModel, cap: number): boolean {
  return !model.maxDriveTb || cap <= model.maxDriveTb;
}

function modelMatches(model: NasModel, raid: RaidLevel, { brand = "any", bays = null, expandableOnly = false }: Filters): boolean {
  if (!model.raid.includes(raid)) return false;
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

export function linesForCapacity(hddPricing: HddPricing, cap: number): string[] {
  return Object.keys(hddPricing[cap] || {});
}

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

  builds.sort((a, b) => a.totalQuote - b.totalQuote || a.units - b.units || a.totalUsable - b.totalUsable);
  return builds;
}

export function bestBuildPerModel(builds: Build[]): Build[] {
  const seen = new Map<string, Build>();
  for (const b of builds) {
    if (!seen.has(b.model.id)) seen.set(b.model.id, b);
  }
  return [...seen.values()];
}

export function topSpeed(spec: string | null | undefined): number {
  const hits = String(spec || "").match(/(\d+(?:\.\d+)?)\s*GbE/gi);
  if (!hits) return 0;
  return Math.max(...hits.map((h) => parseFloat(h)));
}

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

export function bestNetworkAmong(builds: Build[]): (NetworkInfo & { model: NasModel }) | null {
  let best: (NetworkInfo & { model: NasModel }) | null = null;
  for (const b of builds) {
    const net = networkFor(b.model);
    if (net && (!best || net.topGb > best.topGb)) best = { ...net, model: b.model };
  }
  return best;
}

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

export function nearestBuildable(targetTB: number, sizes: number[]): number | null {
  if (!sizes.length) return null;
  const atOrAbove = sizes.find((s) => s >= targetTB);
  if (atOrAbove == null) return sizes[sizes.length - 1];
  const below = [...sizes].reverse().find((s) => s < targetTB);
  if (below == null) return atOrAbove;
  return atOrAbove - targetTB <= targetTB - below ? atOrAbove : below;
}

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

          for (let units = 1; units <= maxUnits; units++) {
            const totalQuote = perUnitQuote * units;
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

  builds.sort((a, b) => b.totalUsable - a.totalUsable || a.totalQuote - b.totalQuote || a.units - b.units);
  return builds;
}

export function suggestBudgetPlan({
  budget,
  raidPool = RAID_REDUNDANCY_ORDER,
  ...rest
}: Catalogue & Filters & { budget: number; raidPool?: RaidLevel[]; extraCost?: ExtraCost }): { raid: RaidLevel; builds: Build[] } | null {
  let best: { raid: RaidLevel; builds: Build[]; usable: number } | null = null;
  for (const raid of raidPool) {
    if (raid === "RAID0") continue;
    const builds = suggestBuildsForBudget({ ...rest, budget, raid });
    if (!builds.length) continue;
    const usable = builds[0].totalUsable;
    if (!best || usable > best.usable) best = { raid, builds, usable };
  }
  if (best) return { raid: best.raid, builds: best.builds };

  if (raidPool.includes("RAID0")) {
    const builds = suggestBuildsForBudget({ ...rest, budget, raid: "RAID0" });
    if (builds.length) return { raid: "RAID0", builds };
  }
  return null;
}

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
