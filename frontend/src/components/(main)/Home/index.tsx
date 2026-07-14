import { AllVaults } from "./AllVaults";
import { FeaturedHero } from "./FeaturedHero";
import { HomeRail } from "./HomeRail";

export function Home() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="sr-only">Earn on Maroon</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <FeaturedHero />
        <HomeRail />
      </div>
      <AllVaults />
    </div>
  );
}
