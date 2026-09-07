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
    (typeof industry.heroImage === "object" && industry.heroImage?.url) || "/serve-vfx.png";

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-ink-800 bg-cover bg-center"
        style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined}
      >
        <div className="absolute inset-0 bg-[#202326]/55" />
        <div className="container-page relative py-14 sm:py-20 lg:py-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
              VFX & Animation
            </span>
          </div>
          <h1 className="font-display mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[58px]">
            Create Without Limits.
          </h1>
          <div className="mt-8 border-t border-white/15 pt-8">
            <p className="max-w-md text-lg text-ink-muted-2">
              Technology built for demanding visual effects, animation and digital production
              workflows.
            </p>
          </div>
        </div>
      </section>

      {/* From Imagination to Screen */}
      <section className="border-b border-border bg-background py-14 sm:py-18 lg:py-24">
        <div className="container-page mx-auto max-w-[860px] text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[30px] lg:text-[38px]">
            From Imagination to Screen
          </h2>
          <p className="mt-6 text-base text-[#5c6166] sm:text-lg lg:text-[18.5px]">
            Visual effects and animation demand more than creativity. Complex scenes, detailed
            assets, simulations and high-resolution output place enormous demands on the
            production workflow.
          </p>
          <p className="mt-4 text-base font-medium text-ink-800 sm:text-lg lg:text-[18.5px]">
            DGB India helps VFX and animation teams keep their creative process moving from
            concept to final frame.
          </p>
        </div>
      </section>

      {/* Powering the Creative Pipeline */}
      <section className="border-t border-[#e5e8ea] bg-background py-14 sm:py-18 lg:py-24">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12">
          <div className="lg:sticky lg:top-[108px] lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              The pipeline
            </span>
            <h2 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-[28px] lg:text-[32px]">
              Powering the Creative Pipeline
            </h2>
          </div>
          <div>
            {PIPELINE_ROWS.map((row, i) => (
              <div
                key={row.title}
                className={`grid grid-cols-[72px_1fr] items-center gap-4 border-t border-[#e5e8ea] py-5 transition-colors hover:bg-[#faf6f7] sm:grid-cols-[116px_1fr] sm:gap-6 sm:py-6 ${
                  i === PIPELINE_ROWS.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="h-[72px] w-[72px] shrink-0 rounded-lg bg-[#eef1f3] sm:h-[116px] sm:w-[116px]" />
                <div>
                  <span className="text-xs font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div className="font-display mt-1 text-lg font-bold sm:text-[22px]">{row.title}</div>
                  <p className="mt-1 text-sm text-[#5c6166] sm:text-[15.5px]">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Demanding Productions */}
      <section className="bg-[#202326] py-14 sm:py-18 lg:py-24">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div
            className="h-[200px] rounded-lg bg-[#2e3236] bg-cover bg-center sm:h-[260px] lg:h-[340px]"
            style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined}
          />
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[28px] lg:text-[34px]">
              Built for Demanding Productions
            </h2>
            <p className="mt-5 text-base text-[#cbd0d4] sm:text-lg lg:text-[17.5px]">
              Modern VFX pipelines involve increasingly complex scenes, higher resolutions and
              larger assets.
            </p>
            <p className="mt-4 text-base text-[#cbd0d4] sm:text-lg lg:text-[17.5px]">
              Teams need to move quickly between modelling, animation, simulation, rendering and
              compositing without technology becoming a bottleneck.
            </p>
            <p className="font-display mt-8 border-t border-[#43484d] pt-6 text-lg font-bold text-white sm:text-xl lg:text-[23px]">
              More detail. More frames. More to create.
            </p>
          </div>
        </div>
      </section>

      {/* Every Frame Matters */}
      <section className="border-y border-[#d9bcc1] bg-[#ecdcdf] py-14 sm:py-18 lg:py-24">
        <div className="container-page">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[28px] lg:text-[32px]">Every Frame Matters</h2>
          <div className="mt-8 space-y-4 sm:mt-10">
            {EVERY_FRAME_ROWS.map((row, i) => (
              <div
                key={row.title}
                className="grid grid-cols-[56px_1fr] items-center gap-4 border border-[#d9bcc1] bg-white p-4 transition-all hover:translate-x-2 hover:shadow-[-8px_0_0_0_#80202c] sm:grid-cols-[96px_1fr] sm:gap-6 sm:p-7"
                style={{ marginRight: `min(${MARGINS[i]}, 4vw)` }}
              >
                <div className="font-display text-xl font-bold text-[#d9bcc1] sm:text-[30px]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-display text-lg font-bold sm:text-[22px]">{row.title}</div>
                  <p className="mt-1 text-sm text-[#4b5055] sm:text-base">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built Around Your Creative Tools */}
      <section className="border-b border-border bg-background py-14 sm:py-18 lg:py-24">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <PuzzleReveal imageUrl={heroImageUrl} />
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[28px] lg:text-[32px]">
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
      <section className="bg-[#202326] py-16 sm:py-20 lg:py-28">
        <div className="container-page mx-auto max-w-[780px] text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[46px]">
            Bring Your Vision to Life.
          </h2>
          <p className="mt-6 text-base text-[#d6dadd] sm:text-lg lg:text-[19px]">
            Your creativity shouldn&rsquo;t be limited by the technology behind it.
          </p>
          <p className="mt-3 text-sm text-ink-muted sm:text-base lg:text-[17px]">
            DGB India helps VFX and animation teams build an environment that keeps pace with
            their creative ambitions.
          </p>
          <div className="mt-9">
            <ButtonLink href="/request-a-solution?source=vfx-animation">
              Tell Us About Your Production &rarr;
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
