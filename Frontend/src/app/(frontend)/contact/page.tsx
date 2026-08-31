import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RequirementForm } from "@/components/forms/RequirementForm";
import { getIndustries, getInfrastructure, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us about your workload and we'll recommend the right infrastructure.",
};

export default async function ContactPage() {
  const [industries, infrastructure, settings] = await Promise.all([
    getIndustries(),
    getInfrastructure(),
    getSiteSettings(),
  ]);

  return (
    <section className="py-20">
      <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Discuss Your Workload.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Tell us what you run, and we&rsquo;ll tell you the infrastructure it needs. No sales
            script — a real conversation with someone who understands the workload.
          </p>

          <div className="mt-10 space-y-4 border-t border-border pt-8">
            {settings?.contact?.email && (
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted">Email</div>
                <a href={`mailto:${settings.contact.email}`} className="mt-1 block text-foreground hover:text-accent-2">
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
  );
}
