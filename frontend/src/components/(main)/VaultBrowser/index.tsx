import { categories } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";
import { BrowserResults } from "./BrowserResults";
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

  return (
    <BrowserResults
      items={items}
      title={label ?? "DeFi vaults"}
      sidebar={
        <ChainFilter
          category={category}
          chain={chain}
          vaultsInCategory={inCategory}
        />
      }
    />
  );
}
