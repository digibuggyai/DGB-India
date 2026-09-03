import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RequirementForm } from "@/components/forms/RequirementForm";
import { getIndustries, getInfrastructure, getPartners, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Digibuggy Enterprise (DGB India) designs, engineers and supports enterprise infrastructure for high-performance computing workloads. Get in touch to discuss your workload.",
};

export default async function AboutPage() {
  const [partners, industries, infrastructure, settings] = await Promise.all([
    getPartners(),
    getIndustries(),
    getInfrastructure(),
    getSiteSettings(),
  ]);

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>About Us</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            An infrastructure partner for demanding workloads.
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Digibuggy Enterprise (DGB India) exists because generic hardware doesn&rsquo;t serve
            specialized work. We design, engineer, deploy and support the compute, storage,
            networking and data-protection infrastructure behind rendering pipelines, ML training
            runs, trading systems, CAD/BIM workflows and broadcast production — built around the
            workload, not sold off a spec sheet.
          </p>
        </div>
      </section>

      <section className="border-b border-border py-16">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Our Approach</h2>
            <p className="mt-3 text-muted">
              Every engagement starts with the workload — the applications, performance
              requirements and growth trajectory — before a single component is chosen. We treat
              infrastructure as an engineering problem, not a procurement checklist.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Engineering Capability</h2>
            <p className="mt-3 text-muted">
              From GPU workstation configuration to multi-node storage architectures, our team
              validates performance against your actual applications — Maya, Houdini, CUDA
              pipelines, backtesting engines — rather than generic benchmarks.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Why Customers Trust Us</h2>
            <p className="mt-3 text-muted">
              We stay involved after deployment — monitoring, maintaining and scaling
              infrastructure as workloads grow, rather than disappearing after the invoice.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">High-Performance Computing Focus</h2>
            <p className="mt-3 text-muted">
              We specialize in the categories that generic vendors treat as an afterthought: GPU
              compute, high-throughput storage, and the networking that ties a cluster together.
            </p>
          </div>
        </div>
      </section>

      {partners.length > 0 && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Partners &amp; OEMs
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4">
              {partners.map((p) => (
                <span key={p.id} className="font-mono text-sm uppercase tracking-wider text-muted">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="scroll-mt-24 py-20">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Discuss Your Workload.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Tell us what you run, and we&rsquo;ll tell you the infrastructure it needs. No sales
              script — a real conversation with someone who understands the workload.
            </p>

            <div className="mt-10 space-y-4 border-t border-border pt-8">
              {settings?.contact?.email && (
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-muted">Email</div>
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className="mt-1 block text-foreground hover:text-accent-2"
                  >
                    {settings.contact.email}
                  </a>
                </div>
              )}
              {settings?.contact?.phone && (
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-muted">Phone</div>
                  <div className="mt-1 text-foreground">{settings.contact.phone}</div>
                </div>
              )}
              {settings?.contact?.address && (
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-muted">Office</div>
                  <div className="mt-1 whitespace-pre-line text-foreground">{settings.contact.address}</div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-8">
            <RequirementForm
              industries={industries.map((i) => ({ id: String(i.id), name: i.name }))}
              infrastructure={infrastructure
                .filter((i) => !i.parent)
                .map((i) => ({ id: String(i.id), name: i.name }))}
            />
          </div>
        </div>
      </section>
    </>
  );
}
