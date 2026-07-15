import { Info, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import type { Vault } from "@/types/earn";
import { EarnButton } from "../EarnButton";
import { VaultAvatar } from "../VaultAvatar";
import { SaveButton } from "./SaveButton";

export function VaultCard({ vault }: { vault: Vault }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <VaultHeader vault={vault} />
      <VaultStats vault={vault} />
      <div className="mt-auto flex gap-2">
        <Link
          href={`/vault/${vault.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[13px] font-semibold text-white shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)]"
        >
          <Info className="size-3.5" />
          View details
        </Link>
        <EarnButton
          vault={vault}
          className="flex flex-1 items-center justify-center rounded-lg bg-success py-2 text-[13px] font-semibold text-white shadow-[0_3px_0_0_var(--color-success-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-success-hover)]"
        >
          Earn
        </EarnButton>
      </div>
    </article>
  );
}

function VaultHeader({ vault }: { vault: Vault }) {
  return (
    <div className="flex items-center gap-3">
      <VaultAvatar vault={vault} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-medium leading-tight">
          {vault.name || vault.protocol.name}
        </h3>
        <p className="truncate text-sm text-muted-foreground">
          {vault.protocol.name} · {vault.chain}
        </p>
      </div>
      <SaveButton vault={vault} />
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
