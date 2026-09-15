import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { NasConfigurator } from "@/components/infrastructure/nas/NasConfigurator";
import { companyInfo } from "@/lib/company";
import { getInfrastructureBySlug, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "NAS Configurator",
  description:
    "Configure and price a NAS for your team — pick a capacity or budget and we work out the unit, drives and RAID level together.",
};

export default async function NasConfigPage() {
  const [settings, nas] = await Promise.all([getSiteSettings(), getInfrastructureBySlug("nas")]);

  return (
    <section className="bg-[#f3f4f5] py-12 sm:py-20">
      <div className="container-page">
        <Eyebrow>NAS Configurator</Eyebrow>
        <h1 className="font-display mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          Configure and Price Your NAS.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[#5c6166] sm:text-lg">
          Tell us how much storage you need, or what you&rsquo;d like to spend. We work out the unit,
          drives and RAID level together &mdash; priced from our live price list.
        </p>
        <div className="mt-8 sm:mt-10">
          {/* The lead is linked to the NAS infrastructure record when it exists. */}
          <NasConfigurator company={companyInfo(settings)} infrastructureId={nas?.id ?? null} />
        </div>
      </div>
    </section>
  );
}
