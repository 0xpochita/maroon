import { FaFire } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { formatPercent } from "@/lib/format";
import { vaults } from "@/lib/mock/earn";

const TOP_VAULTS = [...vaults].sort((a, b) => b.apy - a.apy).slice(0, 5);

export function TopVaults() {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <button type="button" className="flex items-center gap-1 font-semibold">
        Top vaults
        <FiChevronRight className="size-4 text-muted-foreground" />
      </button>
      <ol className="mt-2 flex flex-col">
        {TOP_VAULTS.map((vault, index) => (
          <li
            key={vault.id}
            className="flex items-center gap-3 border-t border-border py-3 first:border-t-0"
          >
            <span className="w-4 text-sm font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {vault.protocol.name}
              </p>
              <p className="text-xs text-muted-foreground">{vault.chain}</p>
            </div>
            <span className="text-sm font-semibold text-success">
              {formatPercent(vault.apy)}
            </span>
            <FaFire className="size-3.5 text-warning" />
            <FiChevronRight className="size-4 text-muted-foreground" />
          </li>
        ))}
      </ol>
    </div>
  );
}
