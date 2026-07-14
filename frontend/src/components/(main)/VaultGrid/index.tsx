import { vaults } from "@/lib/mock/earn";
import { VaultCard } from "./VaultCard";

export function VaultGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vaults.map((vault) => (
        <VaultCard key={vault.id} vault={vault} />
      ))}
    </div>
  );
}
