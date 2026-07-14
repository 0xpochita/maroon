import { Info, TrendingUp } from "lucide-react";
import Image from "next/image";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import type { Vault } from "@/types/earn";

export function VaultCard({ vault }: { vault: Vault }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <VaultHeader vault={vault} />
      <PeriodCells apy={vault.apy} />
      <div className="mt-auto flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <Info className="size-4" />
          View details
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center rounded-xl bg-success/10 py-3 text-sm font-semibold text-success transition-colors hover:bg-success/20"
        >
          Earn
        </button>
      </div>
    </article>
  );
}

function VaultAvatar({ vault }: { vault: Vault }) {
  return (
    <div className="flex shrink-0 -space-x-2">
      <Image
        src={vault.assetLogo}
        alt={vault.asset}
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full border-2 border-surface bg-surface object-contain"
      />
      <Image
        src={vault.protocol.logo}
        alt={vault.protocol.name}
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full border-2 border-surface bg-surface object-contain"
      />
    </div>
  );
}

function VaultHeader({ vault }: { vault: Vault }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <VaultAvatar vault={vault} />
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-tight">{vault.asset}</h3>
          <p className="text-sm text-muted-foreground">
            {vault.protocol.name} · {vault.chain}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-sm">
        <TrendingUp className="size-4 shrink-0 text-success" />
        <span className="font-semibold text-success">
          {formatPercent(vault.apy)} APY
        </span>
        <span className="text-muted-foreground">
          · {formatCompactUsd(vault.tvlUsd)} TVL
        </span>
      </div>
    </div>
  );
}

function PeriodCells({ apy }: { apy: number }) {
  const periods = [
    { label: "7d", value: apy * 0.97 },
    { label: "30d", value: apy },
    { label: "90d", value: apy * 1.04 },
    { label: "1y", value: apy * 1.01 },
  ];
  return (
    <div className="grid grid-cols-4 divide-x divide-border">
      {periods.map((period) => (
        <div key={period.label} className="px-3 first:pl-0">
          <p className="text-xs text-muted-foreground">{period.label}</p>
          <p className="text-sm font-semibold">{formatPercent(period.value)}</p>
        </div>
      ))}
    </div>
  );
}
