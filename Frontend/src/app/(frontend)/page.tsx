import { ScrollHero } from "@/components/home/ScrollHero";
import { WhoWeServe } from "@/components/home/WhoWeServe";
import { InfrastructureOverview } from "@/components/home/InfrastructureOverview";
import { HowWeWork } from "@/components/home/HowWeWork";
import { WhyDGB } from "@/components/home/WhyDGB";
import { Proof } from "@/components/home/Proof";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <ScrollHero />
      <WhoWeServe />
      <InfrastructureOverview />
      <HowWeWork />
      <WhyDGB />
      <Proof />
      <FinalCTA />
    </>
  );
}
