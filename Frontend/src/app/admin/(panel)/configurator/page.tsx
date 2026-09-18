import { Eyebrow } from "@/components/ui/Eyebrow";
import { NasConfigurator } from "@/components/infrastructure/nas/NasConfigurator";
import { companyInfo } from "@/lib/company";
import { getInfrastructureBySlug, getSiteSettings } from "@/lib/content";

// Prices are read per request through a staff-only route, so nothing here is
// cached where a customer-facing render could pick it up.
export const dynamic = "force-dynamic";

export default async function AdminConfiguratorPage() {
  const [settings, nas] = await Promise.all([getSiteSettings(), getInfrastructureBySlug("nas")]);

  return (
    <div className="container-page py-10">
      <Eyebrow>Sales tool</Eyebrow>
      <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">NAS Configurator</h1>
      <p className="mt-3 max-w-2xl text-muted">
        The configurator exactly as a customer sees it, with the internal floor price beside every line and the room
        you have to negotiate. The floor is for this screen only — it is never sent to the customer, and the PDF and
        emailed quotation still show quote prices alone.
      </p>

      <div className="mt-8">
        <NasConfigurator source="sales" company={companyInfo(settings)} infrastructureId={nas?.id ?? null} />
      </div>
    </div>
  );
}
