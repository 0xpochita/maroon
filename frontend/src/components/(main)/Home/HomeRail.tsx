import Link from "next/link";
import { PromoCard } from "./PromoCard";
import { TopVaults } from "./TopVaults";

export function HomeRail() {
  return (
    <aside className="flex flex-col gap-4">
      <PromoCard />
      <TopVaults />
      <Link
        href="/defi"
        className="rounded-full border border-border py-2.5 text-center text-sm font-semibold transition-colors hover:bg-muted"
      >
        Explore all vaults
      </Link>
    </aside>
  );
}
