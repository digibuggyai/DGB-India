import {
  Building2,
  Clapperboard,
  BrainCircuit,
  LineChart,
  Film,
  Server,
  Cpu,
  Monitor,
  Database,
  HardDrive,
  Network,
  ShieldCheck,
  Shield,
  type LucideIcon,
} from "lucide-react";

export const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "architecture-engineering": Building2,
  "vfx-animation": Clapperboard,
  "ai-machine-learning": BrainCircuit,
  "trading-finance": LineChart,
  "media-production": Film,
};

export const INFRA_ICONS: Record<string, LucideIcon> = {
  compute: Cpu,
  servers: Server,
  "gpu-servers": Cpu,
  workstations: Monitor,
  storage: Database,
  nas: HardDrive,
  networking: Network,
  "data-protection": ShieldCheck,
  backup: Shield,
};

export function getIndustryIcon(slug: string): LucideIcon {
  return INDUSTRY_ICONS[slug] ?? Building2;
}

export function getInfraIcon(slug: string): LucideIcon {
  return INFRA_ICONS[slug] ?? Server;
}
