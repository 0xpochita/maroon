import Link from "next/link";
import type { Vault } from "@/types/earn";
import { PromoCard } from "./PromoCard";
import { TopVaults } from "./TopVaults";

export function HomeRail({ vaults }: { vaults: Vault[] }) {
  return (
    <aside className="flex flex-col gap-4">
      <PromoCard />
      <TopVaults vaults={vaults} />
      <Link
        href="/defi"
        className="rounded-full border border-border py-2.5 text-center text-sm font-semibold transition-colors hover:bg-muted"
      >
        Explore all vaults
      </Link>
    </aside>
  );
}
