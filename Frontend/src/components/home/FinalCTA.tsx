import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCTA() {
  return (
    <section className="py-24">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-16 text-center sm:px-16">
            <div
              className="hero-orb-1 pointer-events-none absolute left-1/3 top-0 h-[24rem] w-[24rem] rounded-full opacity-20 blur-[90px]"
              style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Have a Complex Workload? Let&rsquo;s Build the Right Solution.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Tell us what you run. We&rsquo;ll tell you the infrastructure it needs.
              </p>
              <div className="mt-8 flex justify-center">
                <MagneticButton href="/contact">Tell Us About Your Requirement</MagneticButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
