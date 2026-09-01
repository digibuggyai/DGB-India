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
    <>
      <div className="hidden bg-ink-900 text-ink-muted sm:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <span>{settings?.contact?.email || "hello@digibuggy.com"}</span>
          <span className="uppercase tracking-[0.16em]">Enterprise support 24×7</span>
        </div>
      </div>
      <HeaderClient
        siteName={settings?.siteName || "Digibuggy Enterprise"}
        industries={industries}
        infraGroups={infraGroups}
      />
    </>
  );
}
