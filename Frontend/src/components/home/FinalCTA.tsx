import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCTA() {
  return (
    <section className="py-24">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-accent px-8 py-16 sm:px-16">
            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="font-display max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Have a Complex Workload? Let&rsquo;s Build the Right Solution.
              </h2>
              <div className="shrink-0">
                <MagneticButton href="/contact" variant="dark">
                  Tell Us About Your Requirement
                </MagneticButton>
              </div>
            </div>
            <p className="relative mt-4 max-w-xl text-white/80">
              Tell us what you run. We&rsquo;ll tell you the infrastructure it needs.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
