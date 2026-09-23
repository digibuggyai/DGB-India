/* Shapes for the NAS configurator on the NAS infrastructure page.
 *
 * Quote-only by design. The internal DigiBuggy sales tool this is built from
 * carries a minimum ("floor") price beside every quote — a rep's negotiating
 * room. That number never reaches this site: /api/nas-pricing rebuilds the
 * payload field by field and has no line that reads it. So there is no `min`
 * to type here, and nothing for a visitor to find in the network tab. */

export type RaidLevel = "RAID0" | "RAID1" | "RAID5" | "RAID6" | "RAID10";

export type NasModel = {
  id: string;
  brand: string;
  bays: number;
  /** GST-inclusive price per unit. */
  quote: number;
  /** Internal floor price. Only ever present on the sales-side payload. */
  min?: number | null;
  raid: RaidLevel[];
  expandable: boolean;
  /** Free text such as "2.5GbE ×2" — link speed is parsed out of it. */
  network: string;
  networkUpgrade: string;

  /* Detailed specifications, as the manufacturer words them. Every one is
   * optional: a unit with none of them still prices and quotes, it just shows
   * less on its specifications card. Empty string / null means "not recorded",
   * which the UI says outright rather than inventing a figure. */
  cpu: string;
  cpuCores: string;
  memory: string;
  memoryMax: string;
  m2Slots: number | null;
  /** Largest drive the unit accepts, in TB. Nothing bigger is ever quoted in it. */
  maxDriveTb: number | null;
  /** Total bays once expansion units are attached. */
  baysWithExpansion: number | null;
  maxRawTb: number | null;
  usbPorts: string;
  dimensions: string;
  weightKg: number | null;
  warranty: string;
  /** Manufacturer's spec page. Https only — see normalisePricing. */
  specsUrl: string;
};

/* What a family of drives is, as its maker publishes it. One record covers
 * every capacity in the line: an Exos is a 550 TB/year enterprise drive whether
 * it holds 8 TB or 20 TB. `name` is what ties it to the priced drives.
 *
 * Every specification is optional — a line with none of them still prices and
 * quotes, it just shows less. Blank means "not recorded", which the UI says
 * rather than inventing a figure. */
export type DriveLine = {
  name: string;
  brand: string;
  driveClass: "nas" | "enterprise";
  /** Set only on a NAS vendor's own drives, e.g. "Synology". Drives compatibility notes. */
  madeForBrand: string;
  series: string;
  rpm: string;
  cache: string;
  interface: string;
  recording: string;
  workloadTbYear: string;
  mtbf: string;
  warrantyYears: number | null;
  bestFor: string;
  extras: string;
  /** Manufacturer's spec page. Https only — see normalisePricing. */
  specsUrl: string;
};

/** Drive capacity (TB) → drive line (e.g. "IronWolf") → GST-inclusive price per drive. */
export type HddPricing = Record<number, Record<string, { quote: number; min?: number | null }>>;

export type Upgrade = {
  sku: string;
  category: string;
  name: string;
  brand: string;
  spec: string;
  quote: number;
  min?: number | null;
};

export type NasPricing = {
  updatedAt: string | null;
  models: NasModel[];
  capacities: number[];
  hddPricing: HddPricing;
  /** Specifications of the drive families, for the drive step. Prices stay in hddPricing. */
  driveLines: DriveLine[];
  install: { quote: number; min?: number | null };
  /** AMC as a fraction of hardware value — 0.1 is 10%. */
  amcRate: { quote: number; min?: number | null };
  upgrades: Upgrade[];
};

/** One complete proposal. Chassis, drive size, drive count and unit count are
 *  chosen together because they aren't independent: bigger drives need fewer
 *  bays, which can allow a cheaper chassis that beats cheaper drives outright. */
export type Build = {
  model: NasModel;
  driveCap: number;
  driveLine: string;
  drivesPerUnit: number;
  units: number;
  totalUsable: number;
  spareBays: number;
  /** Chassis + drives only; add-ons are priced separately. */
  totalQuote: number;
};

export type CompanyInfo = {
  name: string;
  address: string;
  phones: string[];
  email: string;
};

export type EstimateLine = {
  description: string;
  detail: string;
  qty: number | null;
  rate: number | null;
  amount: number;
};

export type Estimate = {
  ref: string;
  model: NasModel;
  units: number;
  drivesPerUnit: number;
  totalDrives: number;
  driveCap: number;
  driveLine: string;
  raid: RaidLevel;
  raidLabel: string;
  usableTB: number;
  speed: string;
  expandable: boolean;
  lines: EstimateLine[];
  total: number;
  customer: { name: string; company: string; location: string };
};
