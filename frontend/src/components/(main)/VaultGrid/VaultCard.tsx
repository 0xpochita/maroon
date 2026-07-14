import Image from "next/image";
import { PillButton } from "@/components/ui/PillButton";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import type { Vault } from "@/types/earn";

export function VaultCard({ vault }: { vault: Vault }) {
  return (
    <article className="flex flex-col rounded-card border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex -space-x-2">
          <Image
            src={vault.assetLogo}
            alt={vault.asset}
            width={32}
            height={32}
            className="rounded-full border-2 border-surface bg-surface"
          />
          <Image
            src={vault.protocol.logo}
            alt={vault.protocol.name}
            width={32}
            height={32}
            className="rounded-full border-2 border-surface bg-surface"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{vault.asset}</h3>
          <p className="text-xs text-muted-foreground">
            {vault.protocol.name} · {vault.chain}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-success">
            {formatPercent(vault.apy)}
          </p>
          <p className="text-xs text-muted-foreground">APY</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <PillButton tone="green">Earn</PillButton>
        <PillButton tone="muted">Details</PillButton>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {formatCompactUsd(vault.tvlUsd)} TVL
      </p>
    </article>
  );
}
