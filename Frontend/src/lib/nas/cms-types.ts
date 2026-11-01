export const RAID_OPTIONS = ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"] as const;

export type Kind = "models" | "drives" | "upgrades" | "driveLines";

export type CmsModel = {
  id: number;
  model: string;
  brand: string;
  bays: number;
  raid: string[];
  expandable: boolean;
  network?: string | null;
  networkUpgrade?: string | null;
  cpu?: string | null;
  cpuCores?: string | null;
  memory?: string | null;
  memoryMax?: string | null;
  m2Slots?: number | null;
  maxDriveTb?: number | null;
  baysWithExpansion?: number | null;
  expansionNote?: string | null;
  maxRawTb?: number | null;
  usbPorts?: string | null;
  dimensions?: string | null;
  weightKg?: number | null;
  warranty?: string | null;
  specsUrl?: string | null;
  quotePrice: number;
  minPrice?: number | null;
  active: boolean;
};

export type CmsDrive = {
  id: number;
  capacityTb: number;
  line: string;
  quotePrice: number;
  minPrice?: number | null;
  active: boolean;
};

export type CmsDriveLine = {
  id: number;
  name: string;
  brand: string;
  driveClass: "nas" | "enterprise";
  madeForBrand?: string | null;
  series?: string | null;
  rpm?: string | null;
  cache?: string | null;
  interface?: string | null;
  recording?: string | null;
  workloadTbYear?: string | null;
  mtbf?: string | null;
  warrantyYears?: number | null;
  bestFor?: string | null;
  extras?: string | null;
  specsUrl?: string | null;
  sortOrder?: number | null;
};

export type CmsUpgrade = {
  id: number;
  sku: string;
  category: string;
  name: string;
  brand?: string | null;
  spec?: string | null;
  quotePrice: number;
  minPrice?: number | null;
  active: boolean;
};

export type CmsSettings = {
  installQuote: number | null;
  installMin?: number | null;
  amcQuotePercent: number | null;
  amcMinPercent?: number | null;
};

export type CmsLog = {
  id: number;
  action: "created" | "updated" | "deleted";
  itemType: "model" | "drive" | "upgrade" | "settings";
  itemLabel: string;
  userEmail: string;
  userName?: string | null;
  changes?: { field: string; from: unknown; to: unknown }[] | null;
  createdAt: string;
};

export type Catalogue = {
  models: CmsModel[];
  drives: CmsDrive[];
  driveLines: CmsDriveLine[];
  upgrades: CmsUpgrade[];
  settings: CmsSettings;
  logs: CmsLog[];
};
