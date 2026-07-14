import { FilterSidebar } from "../FilterSidebar";
import { VaultGrid } from "../VaultGrid";
import { FilterChips } from "../VaultGrid/FilterChips";

export function VaultBrowser() {
  return (
    <div className="flex gap-6">
      <FilterSidebar />
      <main className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight">DeFi vaults</h1>
        <div className="mt-4">
          <FilterChips />
        </div>
        <div className="mt-5">
          <VaultGrid />
        </div>
      </main>
    </div>
  );
}
