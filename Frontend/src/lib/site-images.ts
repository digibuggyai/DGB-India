const OWN = "/DGB_Image";
const STOCK = "/stock";

type Source = { dir: string; file: string };

const own = (file: string): Source => ({ dir: OWN, file });
const stock = (file: string): Source => ({ dir: STOCK, file });

const INFRASTRUCTURE: Record<string, Source> = {
  "gpu-servers": own("DGX _ GPU Servers.jpeg"),
  compute: own("AI & ML.jpeg"),
  workstations: own("Dell Precision 7960.jpeg"),
  servers: own("data center3.jpeg"),
  networking: own("Data Pipeline Throughput.jpeg"),
  backup: own("Backup.jpeg"),
  nas: stock("nas-drive-bays.jpg"),
  storage: stock("storage-array.jpg"),
  "data-protection": own("data center.webp"),
};

const INDUSTRY_PANEL: Record<string, Source> = {
  "architecture-engineering": own("architectural visuals2.jpeg"),
  "vfx-animation": own("Character Animation.jpeg"),
};

const INDUSTRY_BAND: Record<string, Source> = {
  "architecture-engineering": own("Construction Drawings.jpeg"),
  "vfx-animation": own("Color Grading.jpeg"),
};

const PAGE: Record<string, Source> = {
  about: own("About Us.jpeg"),
  "case-studies": own("Case Studies.jpeg"),
};

const INDUSTRY: Record<string, Source> = {
  "architecture-engineering": own("architecture & engineer.jpeg"),
  "ai-machine-learning": own("AI Research.jpeg"),
  "vfx-animation": stock("colour-grading.jpg"),
  "trading-finance": stock("trading-desk.jpg"),
  "media-production": stock("broadcast-console.jpg"),
};

const HOME_CARD: Record<string, Source> = {
  DGX: INFRASTRUCTURE["gpu-servers"],
  Workstations: INFRASTRUCTURE.workstations,
  Servers: INFRASTRUCTURE.servers,
  Networking: INFRASTRUCTURE.networking,
  Backup: INFRASTRUCTURE.backup,
  NAS: INFRASTRUCTURE.nas,
  Storage: INFRASTRUCTURE.storage,
};

const CONTAIN = new Set(["DGX _ GPU Servers.jpeg", "Dell Precision 7960.jpeg", "Backup.jpeg"]);

function url(source: Source | undefined): string | null {
  return source ? `${source.dir}/${encodeURIComponent(source.file)}` : null;
}

function fit(source: Source | undefined): "cover" | "contain" {
  return source && CONTAIN.has(source.file) ? "contain" : "cover";
}

type WithHero = { slug?: string | null; heroImage?: unknown };

function fromCms(item: WithHero): string | null {
  const media = item.heroImage;
  if (media && typeof media === "object" && "url" in media) {
    const value = (media as { url?: string | null }).url;
    if (value) return value;
  }
  return null;
}

export function infrastructureImage(item: WithHero): string | null {
  return fromCms(item) ?? url(INFRASTRUCTURE[item.slug ?? ""]);
}

export function infrastructureFit(item: WithHero): "cover" | "contain" {
  return fromCms(item) ? "cover" : fit(INFRASTRUCTURE[item.slug ?? ""]);
}

export function industryImage(item: WithHero): string | null {
  return fromCms(item) ?? url(INDUSTRY[item.slug ?? ""]);
}

export function industryCardImage(slug: string): string | null {
  return url(INDUSTRY[slug]);
}

export function industryPanelImage(item: WithHero): string | null {
  return url(INDUSTRY_PANEL[item.slug ?? ""]) ?? industryImage(item);
}

export function industryBandImage(item: WithHero): string | null {
  return url(INDUSTRY_BAND[item.slug ?? ""]) ?? industryImage(item);
}

export function pageImage(key: string): string | null {
  return url(PAGE[key]);
}

export function homeCardImage(name: string): string | null {
  return url(HOME_CARD[name]);
}

export function homeCardFit(name: string): "cover" | "contain" {
  return fit(HOME_CARD[name]);
}
