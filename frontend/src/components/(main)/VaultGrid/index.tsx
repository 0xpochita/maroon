import { vaults } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";
import { VaultCard } from "./VaultCard";

export function VaultGrid({ items = vaults }: { items?: Vault[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((vault) => (
        <VaultCard key={vault.id} vault={vault} />
      ))}
    </div>
  );
}
