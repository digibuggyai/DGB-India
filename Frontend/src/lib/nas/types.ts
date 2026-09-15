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
  raid: RaidLevel[];
  expandable: boolean;
  /** Free text such as "2.5GbE ×2" — link speed is parsed out of it. */
  network: string;
  networkUpgrade: string;
};

/** Drive capacity (TB) → drive line (e.g. "IronWolf") → GST-inclusive price per drive. */
export type HddPricing = Record<number, Record<string, { quote: number }>>;

export type Upgrade = {
  sku: string;
  category: string;
  name: string;
  brand: string;
  spec: string;
  quote: number;
};

export type NasPricing = {
  updatedAt: string | null;
  models: NasModel[];
  capacities: number[];
  hddPricing: HddPricing;
  install: { quote: number };
  /** AMC as a fraction of hardware value — 0.1 is 10%. */
  amcRate: { quote: number };
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
