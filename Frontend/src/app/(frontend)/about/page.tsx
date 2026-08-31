import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { getPartners } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Digibuggy Enterprise (DGB India) designs, engineers and supports enterprise infrastructure for high-performance computing workloads.",
};

export default async function AboutPage() {
  const partners = await getPartners();

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

      <section className="py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Let&rsquo;s talk about your infrastructure.</h2>
          </div>
          <ButtonLink href="/contact">Talk to an Expert</ButtonLink>
        </div>
      </section>
    </>
  );
}
