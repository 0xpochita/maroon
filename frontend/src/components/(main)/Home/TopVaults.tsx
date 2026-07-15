import Link from "next/link";
import { FaFire } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { formatPercent } from "@/lib/format";
import type { Vault } from "@/types/earn";
import { VaultAvatar } from "../VaultAvatar";

export function TopVaults({ vaults }: { vaults: Vault[] }) {
  const top = [...vaults].sort((a, b) => b.apy - a.apy).slice(0, 5);
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <Link href="/defi" className="flex items-center gap-1 font-semibold">
        Top vaults
        <FiChevronRight className="size-4 text-muted-foreground" />
      </Link>
      <ol className="mt-2 flex flex-col">
        {top.map((vault, index) => (
          <li key={vault.id}>
            <Link
              href={`/vault/${vault.id}`}
              className="flex items-center gap-2.5 border-t border-border py-3 transition-colors first:border-t-0 hover:bg-muted/50"
            >
              <span className="w-3 shrink-0 text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <VaultAvatar vault={vault} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {vault.protocol.name}
                </p>
                <p className="text-xs text-muted-foreground">{vault.chain}</p>
              </div>
              <span className="text-sm font-semibold text-success">
                {formatPercent(vault.apy)}
              </span>
              <FaFire className="size-3.5 shrink-0 text-warning" />
              <FiChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
