import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

// The organisations DGB India has delivered for, with the sector each works in.
// Names are written as the client roster records them. No logos: using a
// customer's mark needs their permission, and we hold none on file.
const CLIENTS: { name: string; industry: string }[] = [
  { name: "Government of India", industry: "Public sector" },
  { name: "Innovatiview India Ltd", industry: "IT equipment rental" },
  { name: "Studio Sonrai Pvt Ltd", industry: "Engineering & BIM consultancy" },
  { name: "HBA International (Studio HBA)", industry: "Hospitality interior design" },
  { name: "Airial Advanced Manufacturing", industry: "Transport-equipment manufacturing" },
  { name: "V2F Technology", industry: "SaaS & online visa platform" },
  { name: "Vintage Films", industry: "Film & video production" },
  { name: "Inkwell Animation Studio", industry: "Animation & VFX" },
  { name: "Gauge Data Solutions", industry: "Data analytics & AI" },
  { name: "Nambiar Aviation Advise & Consultation", industry: "Aviation consultancy" },
  { name: "NXGT Gaming Lounge", industry: "Gaming & esports" },
];

export function Clients() {
  return (
    <section className="border-b border-border bg-background py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>Clients</Eyebrow>
          <h2 className="font-display mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted Across Sectors.
          </h2>
          <p className="mt-4 max-w-lg text-muted">
            From a government department to design studios, animation houses and analytics teams —
            {CLIENTS.length} organisations whose work depends on the infrastructure we build.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENTS.map((c) => (
            <RevealItem key={c.name}>
              <div className="border-t border-[#dcdfe2] pt-[22px]">
                <div className="font-display font-medium text-foreground">{c.name}</div>
                <p className="mt-2 text-sm text-muted">{c.industry}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
