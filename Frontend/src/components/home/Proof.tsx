import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getPartners, getCaseStudies, getTestimonials } from "@/lib/content";

export async function Proof() {
  const [partners, caseStudies, testimonials] = await Promise.all([
    getPartners(),
    getCaseStudies(3),
    getTestimonials(1),
  ]);

  const hasContent = partners.length > 0 || caseStudies.length > 0;

  return (
    <section className="border-b border-border bg-surface py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>Proof</Eyebrow>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Deployed, not just proposed.
          </h2>
        </Reveal>

        {partners.length > 0 && (
          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 opacity-80">
            {partners.map((p) => (
              <span key={p.id} className="font-mono text-sm uppercase tracking-wider text-muted">
                {p.name}
              </span>
            ))}
          </Reveal>
        )}

        {caseStudies.length > 0 ? (
          <RevealGroup className="mt-12 grid gap-6 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <RevealItem key={cs.id}>
                <SpotlightCard className="h-full rounded-lg border border-border bg-background p-6">
                  <div className="text-sm font-medium text-foreground">{cs.title}</div>
                  {cs.summary && <p className="mt-2 text-sm text-muted">{cs.summary}</p>}
                  {cs.results?.[0] && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="font-mono text-lg text-accent-2">{cs.results[0].after}</div>
                      <div className="text-xs text-muted">{cs.results[0].metric}</div>
                    </div>
                  )}
                </SpotlightCard>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          !hasContent && (
            <RevealGroup className="mt-12 grid gap-6 lg:grid-cols-3">
              {PLACEHOLDER_PROOF.map((p) => (
                <RevealItem key={p.title}>
                  <SpotlightCard className="h-full rounded-lg border border-dashed border-border p-6">
                    <div className="text-sm font-medium text-foreground">{p.title}</div>
                    <p className="mt-2 text-sm text-muted">{p.desc}</p>
                  </SpotlightCard>
                </RevealItem>
              ))}
            </RevealGroup>
          )
        )}

        {testimonials[0] && (
          <Reveal delay={0.15}>
            <blockquote className="mt-12 max-w-2xl border-l-2 border-accent pl-6">
              <p className="text-lg text-foreground/90">&ldquo;{testimonials[0].quote}&rdquo;</p>
              <footer className="mt-3 text-sm text-muted">
                {testimonials[0].person}
                {testimonials[0].role ? `, ${testimonials[0].role}` : ""}
                {testimonials[0].company ? ` — ${testimonials[0].company}` : ""}
              </footer>
            </blockquote>
          </Reveal>
        )}
      </div>
    </section>
  );
}

const PLACEHOLDER_PROOF = [
  { title: "Render pipeline, cut to hours", desc: "A GPU render farm sized to a 40-artist animation pipeline." },
  { title: "Backtests, minutes not hours", desc: "NVMe-backed compute for a quant desk's historical simulation." },
  { title: "Zero downtime migration", desc: "Storage and backup redesigned around a growing VFX archive." },
];
