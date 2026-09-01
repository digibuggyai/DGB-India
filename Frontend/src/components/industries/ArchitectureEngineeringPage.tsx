import { ButtonLink } from "@/components/ui/Button";
import { PuzzleReveal } from "@/components/industries/PuzzleReveal";
import { DeckStage } from "@/components/industries/DeckStage";
import type { Industry } from "@/payload-types";

const DESIGN_CARDS = [
  { title: "CAD & BIM", desc: "Work with detailed designs, models and project environments." },
  { title: "3D Modelling", desc: "Create and work with complex 3D models and digital environments." },
  { title: "Visualization", desc: "Transform concepts into detailed and immersive visual experiences." },
  { title: "Rendering", desc: "Bring designs to life with high-quality, realistic output." },
  { title: "Simulation", desc: "Support computationally demanding engineering and design workflows." },
];

const APP_TAGS = ["CAD", "BIM", "3D Design", "Visualization", "Rendering", "Simulation"];

const STAGES = [
  { title: "Concept & Design", desc: "Turn ideas into detailed digital designs." },
  { title: "Modelling", desc: "Build and refine complex 2D and 3D environments." },
  { title: "Visualization", desc: "Create realistic representations of your designs." },
  { title: "Rendering", desc: "Produce high-quality visual output efficiently." },
  { title: "Collaboration", desc: "Work seamlessly across teams and projects." },
  { title: "Delivery", desc: "Bring projects from digital concept to final output." },
];

export function ArchitectureEngineeringPage({ industry }: { industry: Industry }) {
  const heroImageUrl =
    typeof industry.heroImage === "object" && industry.heroImage?.url ? industry.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-ink-800 bg-cover bg-center py-28 sm:py-36"
        style={{
          backgroundImage: heroImageUrl
            ? `linear-gradient(90deg, #202326f2 0%, #202326cc 46%, #20232655 100%), url(${heroImageUrl})`
            : undefined,
        }}
      >
        <div className="container-page relative">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Architecture & Engineering
          </span>
          <h1 className="font-display mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[62px]">
            Design Without Limits.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-muted-2">
            Infrastructure built for demanding design, visualization and engineering workflows.
          </p>
          <div className="mt-9">
            <ButtonLink href="/contact">Talk to an Expert &rarr;</ButtonLink>
          </div>
        </div>
      </section>

      {/* From Concept to Completion */}
      <section className="border-b border-border bg-background py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <h2 className="font-display max-w-sm text-[34px] font-bold tracking-tight">
            From Concept to Completion
          </h2>
          <div className="max-w-2xl space-y-5">
            <p className="text-lg text-[#5c6166]">
              From the first concept to the final visualization, architecture and engineering
              workflows demand precision, speed and reliability.
            </p>
            <p className="text-lg text-[#5c6166]">
              As projects become more detailed and complex, the technology behind your work needs
              to keep pace.
            </p>
            <p className="text-lg font-medium text-ink-800">
              DGB India helps architecture and engineering teams work confidently across demanding
              digital workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Powering the Design Process */}
      <section className="border-y border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page">
          <h2 className="font-display text-[32px] font-bold tracking-tight">
            Powering the Design Process
          </h2>
          <div className="mt-10 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {DESIGN_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-lg border border-[#e0e4e7] bg-white transition-shadow hover:border-accent hover:shadow-[0_0_0_1px_#80202c,0_20px_40px_-24px_rgba(128,32,44,0.35)]"
              >
                <div className="h-[150px] rounded-t-lg bg-[#eef1f3]" />
                <div className="p-5">
                  <div className="h-1 w-[30px] bg-accent" />
                  <div className="font-display mt-3 text-[19px] font-bold">{c.title}</div>
                  <p className="mt-2 text-[14.5px] text-[#5c6166]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Your Applications */}
      <section className="border-b border-border bg-background py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight">
              Built for Your Applications
            </h2>
            <p className="mt-5 max-w-lg text-[#5c6166]">
              Your workflow depends on the tools you use every day. From drafting and modelling to
              visualization and simulation, your technology needs to perform alongside your
              applications.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {APP_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#d9bcc1] bg-[#ecdcdf] px-4 py-1.5 text-sm text-[#4d1219]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-6 border-l-2 border-border pl-4 text-sm text-muted">
              Application logos can be displayed here based on the software supported by DGB India.
            </p>
          </div>
          <PuzzleReveal imageUrl={heroImageUrl} />
        </div>
      </section>

      {/* Designed for Every Stage */}
      <section className="bg-ink-800 py-24">
        <div className="container-page">
          <h2 className="font-display text-[26px] font-bold text-white">Designed for Every Stage</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="h-[320px] rounded-lg border border-[#4a4f54] bg-[#2e3236]" />
            <DeckStage cards={STAGES} />
          </div>
        </div>
      </section>

      {/* When Your Projects Get Complex */}
      <section
        className="border-b border-border bg-background bg-cover bg-center py-24"
        style={
          heroImageUrl
            ? {
                backgroundImage: `linear-gradient(90deg, #fffffff7 0%, #ffffffe6 52%, #ffffff8c 100%), url(${heroImageUrl})`,
              }
            : undefined
        }
      >
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-[38px] font-bold tracking-tight">
            When Your Projects Get Complex
          </h2>
          <p className="font-display mt-4 text-[22px] font-semibold text-accent">
            More detail. Larger models. More demanding workflows.
          </p>
          <p className="mt-4 text-lg text-[#5c6166]">
            Modern architecture and engineering teams need technology that can handle increasing
            project complexity without getting in the way of creativity or productivity.
          </p>
          <p className="font-display mt-10 border-t border-border pt-8 text-2xl font-bold">
            Complexity shouldn&rsquo;t slow down your ideas.
          </p>
        </div>
      </section>

      {/* Built for Architects. Engineered for Performance. */}
      <section className="bg-[#ecdcdf] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="font-display text-[36px] font-bold tracking-tight text-[#2e3236]">
              Built for Architects. Engineered for Performance.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-[#5c4448]">
              Whether you&rsquo;re designing a building, developing infrastructure or creating the
              next generation of engineered spaces, DGB India helps you work without technological
              limitations.
            </p>
            <div className="mt-8">
              <ButtonLink href="/contact">Tell Us About Your Project &rarr;</ButtonLink>
            </div>
          </div>
          <div className="border-l-[3px] border-[#d9bcc1] pl-8">
            <p className="text-[17px] text-[#5c4448]">
              As projects become more detailed and complex, the technology behind your work needs
              to keep pace.
            </p>
            <p className="mt-4 text-[17px] font-bold text-ink-800">
              DGB India helps architecture and engineering teams work confidently across demanding
              digital workflows.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
