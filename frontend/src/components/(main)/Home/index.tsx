import Link from "next/link";
import { EarnFeed } from "../EarnFeed";
import { VaultGrid } from "../VaultGrid";
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
      <EarnFeed />
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All vaults</h2>
          <Link
            href="/defi"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Explore all
          </Link>
        </div>
        <div className="mt-4">
          <VaultGrid />
        </div>
      </section>
    </div>
  );
}
