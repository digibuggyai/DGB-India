/* The NAS configurator's price list as stored in the DGB CMS.
 *
 * `minPrice` / `installMin` / `amcMinPercent` are only present when read with
 * an admin session — the CMS withholds them from anonymous requests. */

export const RAID_OPTIONS = ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"] as const;

export type Kind = "models" | "drives" | "upgrades";

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
  baysWithExpansion?: number | null;
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
  upgrades: CmsUpgrade[];
  settings: CmsSettings;
  /** Newest first. Admin reads only — empty for public reads. */
  logs: CmsLog[];
};
