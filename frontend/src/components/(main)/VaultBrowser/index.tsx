import { VaultGrid } from "../VaultGrid";

export function VaultBrowser() {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">DeFi vaults</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse every vault. Earn in one tap.
      </p>
      <div className="mt-5">
        <VaultGrid />
      </div>
    </section>
  );
}
