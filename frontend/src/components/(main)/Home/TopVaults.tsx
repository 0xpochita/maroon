import Image from "next/image";
import { FaFire } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { formatPercent } from "@/lib/format";
import { chainLogos, vaults } from "@/lib/mock/earn";

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
            className="flex items-center gap-2.5 border-t border-border py-3 first:border-t-0"
          >
            <span className="w-3 shrink-0 text-sm font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <span className="relative shrink-0">
              <Image
                src={vault.protocol.logo}
                alt={vault.protocol.name}
                width={28}
                height={28}
                className="size-7 rounded-full object-contain"
              />
              {chainLogos[vault.chain] ? (
                <Image
                  src={chainLogos[vault.chain]}
                  alt={vault.chain}
                  width={14}
                  height={14}
                  className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border border-surface object-cover"
                />
              ) : null}
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
            <FaFire className="size-3.5 shrink-0 text-warning" />
            <FiChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </li>
        ))}
      </ol>
    </div>
  );
}
