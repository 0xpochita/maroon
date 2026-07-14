import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chainLogos } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";

const CHAINS = ["Base", "Arbitrum", "Ethereum"];

function buildHref(category?: string, chain?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (chain) params.set("chain", chain);
  const query = params.toString();
  return query ? `/defi?${query}` : "/defi";
}

export function ChainFilter({
  category,
  chain,
  vaultsInCategory,
}: {
  category?: string;
  chain?: string;
  vaultsInCategory: Vault[];
}) {
  const present = CHAINS.filter((name) =>
    vaultsInCategory.some((vault) => vault.chain === name),
  );

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Chains
      </p>
      <ul className="space-y-1">
        <FilterRow
          href={buildHref(category)}
          active={!chain}
          label="All chains"
          count={vaultsInCategory.length}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-muted">
            <LayoutGrid className="size-3.5" />
          </span>
        </FilterRow>
        {present.map((name) => {
          const slug = name.toLowerCase();
          const count = vaultsInCategory.filter(
            (vault) => vault.chain === name,
          ).length;
          return (
            <FilterRow
              key={name}
              href={buildHref(category, slug)}
              active={chain === slug}
              label={name}
              count={count}
            >
              <ChainIcon chain={name} />
            </FilterRow>
          );
        })}
      </ul>
    </aside>
  );
}

function FilterRow({
  href,
  active,
  label,
  count,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted/60"}`}
      >
        {children}
        <span className="flex-1">{label}</span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </Link>
    </li>
  );
}

function ChainIcon({ chain }: { chain: string }) {
  const logo = chainLogos[chain];
  if (logo) {
    return (
      <Image
        src={logo}
        alt={chain}
        width={24}
        height={24}
        className="size-6 rounded-full object-contain"
      />
    );
  }
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
      {chain.slice(0, 1)}
    </span>
  );
}
