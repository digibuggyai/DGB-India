import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

const CELLS = ["AI", "Rendering", "Data", "High-Performance"];

export function WhatWeSolve() {
  return (
    <section className="border-y border-[#d9bcc1] bg-[#ecdcdf] py-24">
      <div className="container-page">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <div>
              <Eyebrow>What We Solve</Eyebrow>
              <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-[32px]">
                We Design the Infrastructure.
              </h2>
              <p className="mt-4 max-w-[30em] text-[#5c4448]">
                From compute to storage and networking, we bring the right infrastructure
                together for your workload.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#d9bcc1]">
              {CELLS.map((c) => (
                <div
                  key={c}
                  className="flex min-h-[120px] items-center justify-center bg-[#ecdcdf] px-4 text-center"
                >
                  <span className="font-display text-[22px] font-semibold text-ink-800">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
