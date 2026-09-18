import { Eyebrow } from "@/components/ui/Eyebrow";
import { getAdminToken, getAdminUser } from "@/lib/admin-auth";
import { loadCatalogue } from "@/lib/nas/cms";
import type { Catalogue } from "@/lib/nas/cms-types";
import { PriceSheetDownloads } from "../../_components/PriceSheetDownloads";
import { PricingManager } from "../../_components/PricingManager";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [user, token] = await Promise.all([getAdminUser(), getAdminToken()]);

  let catalogue: Catalogue | null = null;
  let error: string | null = null;
  if (user?.role === "admin" && token) {
    try {
      catalogue = await loadCatalogue(token);
    } catch (err) {
      error = err instanceof Error ? err.message : "Couldn't load the price list.";
    }
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">NAS Configurator Pricing</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Every item the NAS configurator quotes — units, drives, upgrades, installation and AMC. Add, update or
            remove anything here and the live configurator uses it straight away.
          </p>
        </div>
        {catalogue ? <PriceSheetDownloads catalogue={catalogue} /> : null}
      </div>

      <div className="mt-8">
        {user?.role !== "admin" ? (
          <Panel title="Admins only">Pricing can only be changed by an admin account.</Panel>
        ) : error || !catalogue ? (
          <Panel title="Couldn't load the price list">{error ?? "The CMS isn't reachable right now."}</Panel>
        ) : (
          <PricingManager initial={catalogue} />
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}
