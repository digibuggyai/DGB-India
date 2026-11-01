export type RaidLevel = "RAID0" | "RAID1" | "RAID5" | "RAID6" | "RAID10";

export type NasModel = {
  id: string;
  brand: string;
  bays: number;
  quote: number;
  min?: number | null;
  raid: RaidLevel[];
  expandable: boolean;
  network: string;
  networkUpgrade: string;

  cpu: string;
  cpuCores: string;
  memory: string;
  memoryMax: string;
  m2Slots: number | null;
  maxDriveTb: number | null;
  baysWithExpansion: number | null;
  expansionNote: string;
  maxRawTb: number | null;
  usbPorts: string;
  dimensions: string;
  weightKg: number | null;
  warranty: string;
  specsUrl: string;
};

export type DriveLine = {
  name: string;
  brand: string;
  driveClass: "nas" | "enterprise";
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
  specsUrl: string;
};

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
  driveLines: DriveLine[];
  install: { quote: number; min?: number | null };
  amcRate: { quote: number; min?: number | null };
  upgrades: Upgrade[];
};

export type Build = {
  model: NasModel;
  driveCap: number;
  driveLine: string;
  drivesPerUnit: number;
  units: number;
  totalUsable: number;
  spareBays: number;
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
