import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCTA() {
  return (
    <section className="bg-accent py-24">
      <div className="container-page">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <h2 className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl">
              Have a Complex Workload?
              <br />
              Let&rsquo;s Build the Right Solution.
            </h2>
            <div className="lg:text-right">
              <MagneticButton href="/contact" variant="dark">
                Tell Us About Your Requirement &rarr;
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
