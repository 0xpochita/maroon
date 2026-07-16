import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chainLogos } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";

const CHAIN_ORDER = [
  "Arbitrum",
  "Base",
  "Ethereum",
  "Optimism",
  "Polygon",
  "BNB Chain",
  "Avalanche",
];

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
  const rank = (name: string) => {
    const i = CHAIN_ORDER.indexOf(name);
    return i === -1 ? CHAIN_ORDER.length : i;
  };
  const present = [
    ...new Set(vaultsInCategory.map((vault) => vault.chain)),
  ].sort((a, b) => rank(a) - rank(b));

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Chains
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
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
    <li className="shrink-0">
      <Link
        href={href}
        className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border px-3 py-2 text-sm transition-colors lg:gap-3 lg:rounded-lg lg:border-0 ${active ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted/60"}`}
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
