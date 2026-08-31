import { getSiteSettings } from "@/lib/content";
import { getIndustriesNav, getInfraNavTree } from "@/lib/nav-data";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const [settings, industries, infraGroups] = await Promise.all([
    getSiteSettings(),
    getIndustriesNav(),
    getInfraNavTree(),
  ]);

  return (
    <HeaderClient
      siteName={settings?.siteName || "Digibuggy Enterprise"}
      industries={industries}
      infraGroups={infraGroups}
    />
  );
}
