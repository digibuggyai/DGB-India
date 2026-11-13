const DIR = "/DGB_Image";

const INFRASTRUCTURE: Record<string, string> = {
  "gpu-servers": "DGX _ GPU Servers.jpeg",
  compute: "AI & ML.jpeg",
  workstations: "Dell Precision 7960.jpeg",
  servers: "data center3.jpeg",
  networking: "Data Pipeline Throughput.jpeg",
  backup: "Backup.jpeg",
  "data-protection": "data center.webp",
};

const INDUSTRY: Record<string, string> = {
  "architecture-engineering": "architecture & engineer.jpeg",
  "vfx-animation": "Color Grading.jpeg",
  "ai-machine-learning": "AI Research.jpeg",
};

const HOME_CARD: Record<string, string> = {
  DGX: "DGX _ GPU Servers.jpeg",
  Workstations: "Dell Precision 7960.jpeg",
  Servers: "data center3.jpeg",
  Networking: "Data Pipeline Throughput.jpeg",
  Backup: "Backup.jpeg",
};

const CONTAIN = new Set(["DGX _ GPU Servers.jpeg", "Dell Precision 7960.jpeg", "Backup.jpeg"]);

function url(file: string | undefined): string | null {
  return file ? `${DIR}/${encodeURIComponent(file)}` : null;
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

export function industryImage(item: WithHero): string | null {
  return fromCms(item) ?? url(INDUSTRY[item.slug ?? ""]);
}

export function homeCardImage(name: string): string | null {
  return url(HOME_CARD[name]);
}

export function homeCardFit(name: string): "cover" | "contain" {
  const file = HOME_CARD[name];
  return file && CONTAIN.has(file) ? "contain" : "cover";
}
