/* Configurator answers → configuration: the React-side counterpart of the sales
 * tool's derive() and priceFor() in app.js.
 *
 * The original mutates its answers while rendering — overwriting the target, the
 * RAID level and the chosen model as it goes. Here the answers are never
 * touched: derive() returns the effective values instead, so React state stays
 * what the visitor actually chose. That also removes a staleness bug: the
 * original wrote the auto-picked network speed into state, so changing the
 * target could leave "2.5GbE" on a unit that now ships with 10GbE. Network speed
 * is never stored — it is always read off the unit that is currently chosen. */

import {
  MAX_UNITS,
  RAID_INFO,
  bestBuildPerModel,
  buildableSizes,
  inr,
  labelForSpeed,
  nearestBuildable,
  networkFor,
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
  /** The capacity asked for. A nearby size is shown if this one can't be built. */
  targetTB: number;
  budget: number | null;
  brand: string;
  bays: number | null;
  raid: RaidLevel;
  /** Budget mode only: pick the most protective level that fits. */
  raidAuto: boolean;
  expandable: boolean;
  modelId: string | null;
  /** False once a unit is chosen by hand. */
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
  /** Buildable capacities (capacity mode only). */
  sizes: number[];
  /** The effective usable target: as asked, the closest buildable size, or — by budget — what the build delivers. */
  targetTB: number;
  /** The asked-for capacity, when it couldn't be built and a nearby size is shown instead. */
  movedFrom: number | null;
  raid: RaidLevel;
  builds: Build[];
  options: Build[];
  build: Build | null;
  autoPick: boolean;
};

/** Narrow by any drive choice, then settle on a unit: the visitor's pick if it
 *  still qualifies, otherwise the recommendation.
 *
 *  Size is applied first, then line, and a choice nothing can satisfy is
 *  dropped on its own. Filtering on both at once meant an impossible drive
 *  size still pinned would swallow a perfectly good drive line: the click
 *  registered and the recommendation didn't move. */
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

    let raid = a.raid;
    let builds: Build[];
    if (a.raidAuto) {
      const plan = suggestBudgetPlan({ budget, ...catalogue });
      if (!plan) {
        return unbuilt(a, "budget", `Nothing fits ${inr(budget)} with these choices — widen the brand or bays, or raise the budget.`);
      }
      raid = plan.raid;
      builds = plan.builds;
    } else {
      builds = suggestBuildsForBudget({ budget, raid, ...catalogue });
      if (!builds.length) {
        return unbuilt(a, "budget", `No ${RAID_INFO[raid].title} build fits ${inr(budget)} — let us choose the RAID level, or try another.`);
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

/* ---------------- which options can actually be built ---------------- */

export type Feasible = {
  /** Chassis sizes that can reach the target, ignoring any pinned size. */
  bays: Set<number>;
  caps: Set<number>;
  lines: Set<string>;
  /** The builds the bay figures came from, for the "4× 10 TB" hints. */
  bayPool: Build[];
};

/**
 * The options worth offering, read off the same build pool the recommendation
 * engine uses — so the pickers can't drift from the catalogue.
 *
 * Bays are worked out as if no size were pinned: with the pinned size filtered
 * in, every other tier would look unreachable and there'd be no way back.
 *
 * Only chassis sizes the array actually fills are offered. A 4-bay unit will
 * hold two drives perfectly well, but at 4 TB every size from 2 to 8 bays then
 * reads the identical "2× 2 TB" and the extra ones look like duplicates rather
 * than a more expensive box with empty bays. Where nothing fits exactly — a
 * three-drive RAID 5 has no three-bay chassis to live in — the sizes that waste
 * the fewest bays are offered instead, so there is always something to pick.
 *
 * Drive size and line follow pickBuild's precedence, so what's offered is
 * exactly what will be honoured: sizes are judged against the whole pool, and
 * lines against the chosen size — a line that can't be had in that size greys
 * out. An impossible size is ignored rather than grey out every line.
 */
export function feasibleOptions(a: Answers, P: NasPricing, d: Derived): Feasible {
  const bayPool = a.bays == null ? d.builds : derive({ ...a, bays: null }, P).builds;
  const byCap = a.driveCap == null ? d.builds : d.builds.filter((b) => b.driveCap === a.driveCap);

  // The tightest fit each chassis size can manage, in bays left empty per unit.
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

/* ---------------- pricing ---------------- */

/** The same money at the internal floor. Null wherever a floor is unknown —
 *  which is always the case on the public site. */
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

/** The RAM/NIC product chosen, or null once it stops existing in the price list. */
export function selectedUpgrade(P: NasPricing, category: "RAM" | "NIC", sku: string | null): Upgrade | null {
  if (!sku) return null;
  return P.upgrades.find((u) => u.category === category && u.sku === sku) ?? null;
}

/** Total = hardware (NAS + drives + upgrades) + installation + AMC on hardware. */
export function priceFor(build: Build | null, a: Answers, P: NasPricing): Price | null {
  if (!build) return null;

  const driveRate = P.hddPricing[build.driveCap]?.[build.driveLine]?.quote ?? 0;
  const totalDrives = build.drivesPerUnit * build.units;
  const ram = selectedUpgrade(P, "RAM", a.ramSku);
  const nic = selectedUpgrade(P, "NIC", a.nicSku);

  const nas = build.model.quote * build.units;
  const hdd = driveRate * totalDrives;
  // One per chassis: two units means two RAM kits and two network cards.
  const ramAmount = ram ? ram.quote * build.units : 0;
  const nicAmount = nic ? nic.quote * build.units : 0;
  const install = a.includeInstall ? P.install.quote * build.units : 0;
  const hardware = nas + hdd + ramAmount + nicAmount;
  const amc = a.includeAMC ? hardware * P.amcRate.quote : 0;

  // A floor needs a minimum on both the unit and the drive; without either
  // there is no honest figure, so none is offered.
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

/** What the build can do on the network, and the speed to show. */
export function speedFor(
  build: Build | null,
  nic: Upgrade | null,
): { net: NetworkInfo | null; nicTopGb: number; topGb: number; speed: string | null } {
  const net = networkFor(build?.model);
  const nicTopGb = nic ? topSpeed(`${nic.name} ${nic.spec}`) : 0;
  const topGb = Math.max(net?.topGb ?? 0, nicTopGb);
  return { net, nicTopGb, topGb, speed: labelForSpeed(topGb) ?? net?.quotable ?? null };
}

/* ---------------- estimate & lead ---------------- */

/** The priced lines as a customer reads them: what, how many, at what rate. */
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

/** The configuration as plain text, filed with the lead so the sales team sees
 *  exactly what was configured. */
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
