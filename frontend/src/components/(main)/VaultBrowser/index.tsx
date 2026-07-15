import Image from "next/image";
import { categories } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";
import { VaultGrid } from "../VaultGrid";
import { ChainFilter } from "./ChainFilter";

export function VaultBrowser({
  vaults,
  category,
  chain,
}: {
  vaults: Vault[];
  category?: string;
  chain?: string;
}) {
  const label = category
    ? categories.find(
        (name) => name.toLowerCase().replace(/\s+/g, "-") === category,
      )
    : undefined;
  const inCategory = category
    ? vaults.filter((vault) => vault.categories.includes(category))
    : vaults;
  const items = chain
    ? inCategory.filter((vault) => vault.chain.toLowerCase() === chain)
    : inCategory;
  const count = items.length;

  return (
    <section>
      <div className="flex items-center gap-2.5">
        <Image
          src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
          alt="Maroon"
          width={28}
          height={25}
        />
        <h1 className="text-2xl font-semibold">{label ?? "DeFi vaults"}</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {count} vault{count === 1 ? "" : "s"} · Earn in one tap.
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
        <ChainFilter
          category={category}
          chain={chain}
          vaultsInCategory={inCategory}
        />
        <div>{count > 0 ? <VaultGrid items={items} /> : <EmptyState />}</div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <p className="font-semibold">No vaults yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        New opportunities in this category are coming soon.
      </p>
    </div>
  );
}
