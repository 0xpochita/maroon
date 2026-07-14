import { Info, TrendingUp } from "lucide-react";
import Image from "next/image";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { chainLogos } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";

export function VaultCard({ vault }: { vault: Vault }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <VaultHeader vault={vault} />
      <VaultStats vault={vault} />
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
  const chainLogo = chainLogos[vault.chain];
  return (
    <span className="relative shrink-0">
      <Image
        src={vault.protocol.logo}
        alt={vault.protocol.name}
        width={40}
        height={40}
        className="size-10 rounded-full object-contain"
      />
      {chainLogo ? (
        <Image
          src={chainLogo}
          alt={vault.chain}
          width={18}
          height={18}
          className="absolute -right-0.5 -bottom-0.5 size-[18px] rounded-full border-2 border-surface bg-surface object-contain"
        />
      ) : null}
    </span>
  );
}

function VaultHeader({ vault }: { vault: Vault }) {
  return (
    <div className="flex items-center gap-3">
      <VaultAvatar vault={vault} />
      <div className="min-w-0">
        <h3 className="text-lg font-normal leading-tight">
          {vault.protocol.name}
        </h3>
        <p className="text-sm text-muted-foreground">{vault.chain}</p>
      </div>
    </div>
  );
}

function VaultStats({ vault }: { vault: Vault }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="flex items-center gap-1 text-2xl font-bold text-success">
          <TrendingUp className="size-5" />
          {formatPercent(vault.apy)}
        </p>
        <p className="text-xs text-muted-foreground">yield · per year</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">
          {formatCompactUsd(vault.tvlUsd)}
        </p>
        <p className="text-xs text-muted-foreground">total deposited</p>
      </div>
    </div>
  );
}
