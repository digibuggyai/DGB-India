import { ButtonLink } from "@/components/ui/Button";
import { PuzzleReveal } from "@/components/industries/PuzzleReveal";
import type { Industry } from "@/payload-types";

const PIPELINE_ROWS = [
  { title: "3D Modelling", desc: "Build detailed characters, environments and digital assets." },
  { title: "Animation", desc: "Bring characters, objects and environments to life." },
  { title: "Simulation", desc: "Create realistic effects, environments and physical interactions." },
  { title: "Rendering", desc: "Turn complex scenes into final frames efficiently." },
  { title: "Compositing", desc: "Bring multiple visual elements together into a finished shot." },
  { title: "Post-Production", desc: "Refine, process and deliver the final visual experience." },
];

const EVERY_FRAME_ROWS = [
  { title: "Complex Scenes", desc: "Work with detailed environments, characters and effects." },
  { title: "Faster Iteration", desc: "Reduce the time between creative decisions and results." },
  { title: "High-Resolution Production", desc: "Work confidently with increasingly demanding visual formats." },
  { title: "Large-Scale Projects", desc: "Handle growing assets, projects and production requirements." },
  { title: "Team Collaboration", desc: "Keep artists and production teams connected throughout the pipeline." },
];

const MARGINS = ["0%", "5%", "10%", "15%", "20%"];

const APP_TAGS = ["3D", "Animation", "Simulation", "Rendering", "Compositing", "Post-Production"];

export function VfxAnimationPage({ industry }: { industry: Industry }) {
  const heroImageUrl =
    typeof industry.heroImage === "object" && industry.heroImage?.url ? industry.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-[#202326]">
        <div className="container-page grid min-h-[560px] gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center py-20">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
              VFX & Animation
            </span>
            <h1 className="font-display mt-4 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[58px]">
              Create Without Limits.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted-2">
              Technology built for demanding visual effects, animation and digital production
              workflows.
            </p>
            <div className="mt-9">
              <ButtonLink href="/contact">Talk to an Expert &rarr;</ButtonLink>
            </div>
          </div>
          <div
            className="min-h-[280px] bg-ink-800 bg-cover bg-center"
            style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined}
          />
        </div>
      </section>

      {/* From Imagination to Screen */}
      <section className="border-b border-border bg-background py-24">
        <div className="container-page mx-auto max-w-[860px] text-center">
          <h2 className="font-display text-[38px] font-bold tracking-tight">
            From Imagination to Screen
          </h2>
          <p className="mt-6 text-[18.5px] text-[#5c6166]">
            Visual effects and animation demand more than creativity. Complex scenes, detailed
            assets, simulations and high-resolution output place enormous demands on the
            production workflow.
          </p>
          <p className="mt-4 text-[18.5px] font-medium text-ink-800">
            DGB India helps VFX and animation teams keep their creative process moving from
            concept to final frame.
          </p>
        </div>
      </section>

      {/* Powering the Creative Pipeline */}
      <section className="border-t border-[#e5e8ea] bg-background py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
          <div className="lg:sticky lg:top-[108px] lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              The pipeline
            </span>
            <h2 className="font-display mt-4 text-[32px] font-bold tracking-tight">
              Powering the Creative Pipeline
            </h2>
          </div>
          <div>
            {PIPELINE_ROWS.map((row, i) => (
              <div
                key={row.title}
                className={`grid grid-cols-[116px_1fr] items-center gap-6 border-t border-[#e5e8ea] py-6 transition-colors hover:bg-[#faf6f7] ${
                  i === PIPELINE_ROWS.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="h-[116px] w-[116px] shrink-0 rounded-lg bg-[#eef1f3]" />
                <div>
                  <span className="text-xs font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div className="font-display mt-1 text-[22px] font-bold">{row.title}</div>
                  <p className="mt-1 text-[15.5px] text-[#5c6166]">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Demanding Productions */}
      <section className="bg-[#202326] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div
            className="h-[340px] rounded-lg bg-[#2e3236] bg-cover bg-center"
            style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined}
          />
          <div>
            <h2 className="font-display text-[34px] font-bold tracking-tight text-white">
              Built for Demanding Productions
            </h2>
            <p className="mt-5 text-[17.5px] text-[#cbd0d4]">
              Modern VFX pipelines involve increasingly complex scenes, higher resolutions and
              larger assets.
            </p>
            <p className="mt-4 text-[17.5px] text-[#cbd0d4]">
              Teams need to move quickly between modelling, animation, simulation, rendering and
              compositing without technology becoming a bottleneck.
            </p>
            <p className="font-display mt-8 border-t border-[#43484d] pt-6 text-[23px] font-bold text-white">
              More detail. More frames. More to create.
            </p>
          </div>
        </div>
      </section>

      {/* Every Frame Matters */}
      <section className="border-y border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page">
          <h2 className="font-display text-[32px] font-bold tracking-tight">Every Frame Matters</h2>
          <div className="mt-10 space-y-4">
            {EVERY_FRAME_ROWS.map((row, i) => (
              <div
                key={row.title}
                className="grid grid-cols-[96px_1fr] items-center gap-6 border border-[#d9bcc1] bg-white p-7 transition-all hover:translate-x-2 hover:shadow-[-8px_0_0_0_#80202c]"
                style={{ marginRight: MARGINS[i] }}
              >
                <div className="font-display text-[30px] font-bold text-[#d9bcc1]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-display text-[22px] font-bold">{row.title}</div>
                  <p className="mt-1 text-base text-[#4b5055]">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built Around Your Creative Tools */}
      <section className="border-b border-border bg-background py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <PuzzleReveal imageUrl={heroImageUrl} />
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight">
              Built Around Your Creative Tools
            </h2>
            <p className="mt-5 text-lg text-[#5c6166]">
              Your pipeline depends on the applications your artists use every day. DGB India works
              around the tools and workflows that power modern VFX and animation.
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
              Application logos can be displayed here based on the software and platforms
              supported by DGB India.
            </p>
          </div>
        </div>
      </section>

      {/* Bring Your Vision to Life */}
      <section className="bg-[#202326] py-28">
        <div className="container-page mx-auto max-w-[780px] text-center">
          <h2 className="font-display text-[46px] font-bold tracking-tight text-white">
            Bring Your Vision to Life.
          </h2>
          <p className="mt-6 text-[19px] text-[#d6dadd]">
            Your creativity shouldn&rsquo;t be limited by the technology behind it.
          </p>
          <p className="mt-3 text-[17px] text-ink-muted">
            DGB India helps VFX and animation teams build an environment that keeps pace with
            their creative ambitions.
          </p>
          <div className="mt-9">
            <ButtonLink href="/contact">Tell Us About Your Production &rarr;</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
