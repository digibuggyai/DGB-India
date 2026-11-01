/* COPY — do not edit here.
 *
 * Taken from Frontend/src/lib/nas/configure.ts by Frontend/scripts/update-spec.ts,
 * so that docs/nas-configurator-spec.md ships the engine it describes.
 * Edit the original and re-run the script.
 */
import {
  MAX_UNITS,
  RAID_INFO,
  bestBuildPerModel,
  buildableSizes,
  inr,
  labelForSpeed,
  nearestBuildable,
  networkFor,
  cheapestOutlay,
  suggestBudgetPlan,
  suggestBuilds,
  suggestBuildsForBudget,
  topSpeed,
  type NetworkInfo,
} from "./logic";
import type { Build, EstimateLine, NasPricing, RaidLevel, Upgrade } from "./types";

export type StorageMode = "capacity" | "budget";

export type Answers = {
  storageMode: StorageMode;
  targetTB: number;
  budget: number | null;
  brand: string;
  bays: number | null;
  raid: RaidLevel;
  raidAuto: boolean;
  expandable: boolean;
  modelId: string | null;
  autoPick: boolean;
  driveCap: number | null;
  driveLine: string | null;
  ramSku: string | null;
  nicSku: string | null;
  includeInstall: boolean;
  includeAMC: boolean;
};

export const INITIAL_ANSWERS: Answers = {
  storageMode: "capacity",
  targetTB: 20,
  budget: 200000,
  brand: "any",
  bays: null,
  raid: "RAID5",
  raidAuto: true,
  expandable: false,
  modelId: null,
  autoPick: true,
  driveCap: null,
  driveLine: null,
  ramSku: null,
  nicSku: null,
  includeInstall: true,
  includeAMC: false,
};

export const BUDGET_PRESETS = [100000, 150000, 200000, 300000, 500000];
export const CAPACITY_PRESETS = [10, 20, 50, 100];

export type Derived = {
  mode: StorageMode;
  error: string | null;
  sizes: number[];
  targetTB: number;
  movedFrom: number | null;
  raid: RaidLevel;
  builds: Build[];
  options: Build[];
  build: Build | null;
  autoPick: boolean;
};

function pickBuild(a: Answers, builds: Build[]): Pick<Derived, "options" | "build" | "autoPick"> {
  const byCap = a.driveCap == null ? builds : builds.filter((b) => b.driveCap === a.driveCap);
  const capPool = byCap.length ? byCap : builds;
  const byLine = a.driveLine == null ? capPool : capPool.filter((b) => b.driveLine === a.driveLine);
  const pool = byLine.length ? byLine : capPool;
  const options = bestBuildPerModel(pool);
  const pinned = a.autoPick ? null : (pool.find((b) => b.model.id === a.modelId) ?? null);
  return { options, build: pinned ?? options[0] ?? null, autoPick: !pinned };
}

function unbuilt(a: Answers, mode: StorageMode, error: string, raid: RaidLevel = a.raid): Derived {
  return { mode, error, sizes: [], targetTB: a.targetTB, movedFrom: null, raid, builds: [], options: [], build: null, autoPick: a.autoPick };
}

export function derive(a: Answers, P: NasPricing): Derived {
  const catalogue = {
    models: P.models,
    hddPricing: P.hddPricing,
    capacities: P.capacities,
    brand: a.brand,
    bays: a.bays,
    expandableOnly: a.expandable,
    maxUnits: MAX_UNITS,
  };

  if (a.storageMode === "budget") {
    const budget = a.budget;
    if (budget == null || !(budget > 0)) return unbuilt(a, "budget", "Enter a budget to size against.");

    const extraCost = (hardware: number, units: number) =>
      (a.includeInstall ? P.install.quote * units : 0) + (a.includeAMC ? hardware * P.amcRate.quote : 0);

    let raid = a.raid;
    let builds: Build[];
    if (a.raidAuto) {
      const plan = suggestBudgetPlan({ budget, extraCost, ...catalogue });
      if (!plan) {
        const least = cheapestOutlay({ extraCost, ...catalogue });
        return unbuilt(
          a,
          "budget",
          least == null
            ? "Nothing on our price list can be built with these choices — widen the brand, bays or RAID level."
            : `${inr(budget)} doesn't cover a complete configuration. The least we can build with these choices is ${inr(least)}.`,
        );
      }
      raid = plan.raid;
      builds = plan.builds;
    } else {
      builds = suggestBuildsForBudget({ budget, raid, extraCost, ...catalogue });
      if (!builds.length) {
        const least = cheapestOutlay({ raidPool: [raid], extraCost, ...catalogue });
        return unbuilt(
          a,
          "budget",
          least == null
            ? `No ${RAID_INFO[raid].title} build is possible with these choices — try another level.`
            : `No ${RAID_INFO[raid].title} build fits ${inr(budget)} — the cheapest is ${inr(least)}. Let us choose the level, or raise the budget.`,
        );
      }
    }

    const picked = pickBuild(a, builds);
    return {
      mode: "budget",
      error: null,
      sizes: [],
      targetTB: picked.build ? picked.build.totalUsable : a.targetTB,
      movedFrom: null,
      raid,
      builds,
      ...picked,
    };
  }

  const sizes = buildableSizes({ raid: a.raid, ...catalogue });
  if (!sizes.length) {
    return { ...unbuilt(a, "capacity", "Nothing on our price list can be built with these choices — widen the brand, bays or RAID level."), sizes };
  }

  const targetTB = sizes.includes(a.targetTB) ? a.targetTB : (nearestBuildable(a.targetTB, sizes) ?? a.targetTB);
  const builds = suggestBuilds({ targetTB, raid: a.raid, ...catalogue });
  return {
    mode: "capacity",
    error: null,
    sizes,
    targetTB,
    movedFrom: targetTB !== a.targetTB ? a.targetTB : null,
    raid: a.raid,
    builds,
    ...pickBuild(a, builds),
  };
}

export type Feasible = {
  bays: Set<number>;
  caps: Set<number>;
  lines: Set<string>;
  bayPool: Build[];
};

export function feasibleOptions(a: Answers, P: NasPricing, d: Derived): Feasible {
  const bayPool = a.bays == null ? d.builds : derive({ ...a, bays: null }, P).builds;
  const byCap = a.driveCap == null ? d.builds : d.builds.filter((b) => b.driveCap === a.driveCap);

  const spare = new Map<number, number>();
  for (const b of bayPool) {
    const empty = b.model.bays - b.drivesPerUnit;
    const best = spare.get(b.model.bays);
    if (best == null || empty < best) spare.set(b.model.bays, empty);
  }
  const tightest = spare.size ? Math.min(...spare.values()) : 0;

  return {
    bays: new Set([...spare].filter(([, empty]) => empty === tightest).map(([tier]) => tier)),
    caps: new Set(d.builds.map((b) => b.driveCap)),
    lines: new Set((byCap.length ? byCap : d.builds).map((b) => b.driveLine)),
    bayPool,
  };
}

export type Floor = {
  driveRate: number;
  nas: number;
  hdd: number;
  ram: number;
  nic: number;
  install: number;
  amc: number;
  hardware: number;
  total: number;
};

export type Price = {
  totalDrives: number;
  driveRate: number;
  nas: number;
  hdd: number;
  ram: number;
  nic: number;
  install: number;
  amc: number;
  hardware: number;
  total: number;
  floor: Floor | null;
};

export function selectedUpgrade(P: NasPricing, category: "RAM" | "NIC", sku: string | null): Upgrade | null {
  if (!sku) return null;
  return P.upgrades.find((u) => u.category === category && u.sku === sku) ?? null;
}

export function priceFor(build: Build | null, a: Answers, P: NasPricing): Price | null {
  if (!build) return null;

  const driveRate = P.hddPricing[build.driveCap]?.[build.driveLine]?.quote ?? 0;
  const totalDrives = build.drivesPerUnit * build.units;
  const ram = selectedUpgrade(P, "RAM", a.ramSku);
  const nic = selectedUpgrade(P, "NIC", a.nicSku);

  const nas = build.model.quote * build.units;
  const hdd = driveRate * totalDrives;
  const ramAmount = ram ? ram.quote * build.units : 0;
  const nicAmount = nic ? nic.quote * build.units : 0;
  const install = a.includeInstall ? P.install.quote * build.units : 0;
  const hardware = nas + hdd + ramAmount + nicAmount;
  const amc = a.includeAMC ? hardware * P.amcRate.quote : 0;

  const modelMin = build.model.min ?? null;
  const driveMin = P.hddPricing[build.driveCap]?.[build.driveLine]?.min ?? null;
  let floor: Floor | null = null;
  if (modelMin != null && driveMin != null) {
    const nasFloor = modelMin * build.units;
    const hddFloor = driveMin * totalDrives;
    const ramFloor = ram ? (ram.min ?? ram.quote) * build.units : 0;
    const nicFloor = nic ? (nic.min ?? nic.quote) * build.units : 0;
    const installFloor = a.includeInstall ? (P.install.min ?? P.install.quote) * build.units : 0;
    const hardwareFloor = nasFloor + hddFloor + ramFloor + nicFloor;
    const amcFloor = a.includeAMC ? hardwareFloor * (P.amcRate.min ?? P.amcRate.quote) : 0;
    floor = {
      driveRate: driveMin,
      nas: nasFloor,
      hdd: hddFloor,
      ram: ramFloor,
      nic: nicFloor,
      install: installFloor,
      amc: amcFloor,
      hardware: hardwareFloor,
      total: hardwareFloor + installFloor + amcFloor,
    };
  }

  return { totalDrives, driveRate, nas, hdd, ram: ramAmount, nic: nicAmount, install, amc, hardware, total: hardware + install + amc, floor };
}

export function speedFor(
  build: Build | null,
  nic: Upgrade | null,
): { net: NetworkInfo | null; nicTopGb: number; topGb: number; speed: string | null } {
  const net = networkFor(build?.model);
  const nicTopGb = nic ? topSpeed(`${nic.name} ${nic.spec}`) : 0;
  const topGb = Math.max(net?.topGb ?? 0, nicTopGb);
  return { net, nicTopGb, topGb, speed: labelForSpeed(topGb) ?? net?.quotable ?? null };
}

export function estimateLines(build: Build, price: Price, a: Answers, P: NasPricing, raid: RaidLevel): EstimateLine[] {
  const lines: EstimateLine[] = [
    {
      description: `${build.model.id} — ${build.model.brand} ${build.model.bays}-bay NAS`,
      detail: build.model.network ? `Network: ${build.model.network}` : "",
      qty: build.units,
      rate: build.model.quote,
      amount: price.nas,
    },
    {
      description: `${build.driveCap} TB ${build.driveLine} NAS hard drive`,
      detail: `${build.drivesPerUnit} per unit, configured as ${RAID_INFO[raid].title}`,
      qty: price.totalDrives,
      rate: price.driveRate,
      amount: price.hdd,
    },
  ];

  const ram = selectedUpgrade(P, "RAM", a.ramSku);
  if (ram) {
    lines.push({ description: ram.name, detail: [ram.brand, ram.spec].filter(Boolean).join(" · ") || "RAM upgrade", qty: build.units, rate: ram.quote, amount: price.ram });
  }
  const nic = selectedUpgrade(P, "NIC", a.nicSku);
  if (nic) {
    lines.push({ description: nic.name, detail: [nic.brand, nic.spec].filter(Boolean).join(" · ") || "Network card", qty: build.units, rate: nic.quote, amount: price.nic });
  }
  if (a.includeInstall) {
    lines.push({ description: "On-site installation & setup", detail: "Racking, RAID configuration, network setup", qty: build.units, rate: P.install.quote, amount: price.install });
  }
  if (a.includeAMC) {
    lines.push({ description: "Annual maintenance (AMC)", detail: `${Math.round(P.amcRate.quote * 100)}% of hardware value`, qty: null, rate: null, amount: price.amc });
  }
  return lines;
}

export function estimateRef(now: Date = new Date()): string {
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `DGB-NAS-${stamp}-${now.getTime().toString(36).slice(-4).toUpperCase()}`;
}

export function leadSummary(d: Derived, build: Build, price: Price, speed: string | null, a: Answers, P: NasPricing, ref: string): string {
  const ram = selectedUpgrade(P, "RAM", a.ramSku);
  const nic = selectedUpgrade(P, "NIC", a.nicSku);
  const addons = [a.includeInstall ? "Installation & setup" : null, a.includeAMC ? `AMC (${Math.round(P.amcRate.quote * 100)}%)` : null]
    .filter(Boolean)
    .join(", ");

  return [
    `NAS configurator request · ${ref}`,
    "",
    `Unit: ${build.model.id} (${build.model.brand}, ${build.model.bays}-bay)${build.units > 1 ? ` × ${build.units}` : ""}`,
    `Drives: ${price.totalDrives} × ${build.driveCap} TB ${build.driveLine}`,
    `RAID: ${RAID_INFO[d.raid].title} — ${build.totalUsable} TB usable`,
    `Network: ${speed ?? "Not specified"}`,
    ram ? `RAM upgrade: ${ram.name}` : null,
    nic ? `Network card: ${nic.name}` : null,
    `Add-ons: ${addons || "None"}`,
    "",
    d.mode === "budget" ? `Sized by budget: ${inr(a.budget)}` : `Sized by capacity: ${d.targetTB} TB`,
    `Preferences: brand ${a.brand === "any" ? "any" : a.brand} · bays ${a.bays ?? "auto"} · expansion ${a.expandable ? "required" : "not required"}`,
    "",
    `Estimated total (incl. GST): ${inr(price.total)}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
