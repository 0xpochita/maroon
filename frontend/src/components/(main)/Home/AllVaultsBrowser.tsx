"use client";

import { AnimatePresence } from "framer-motion";
import { Bookmark, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categories } from "@/lib/mock/earn";
import { useSavedStore } from "@/stores/saved";
import type { Vault } from "@/types/earn";
import { VaultGrid } from "../VaultGrid";
import {
  Empty,
  FilterPopover,
  IconBtn,
  SearchField,
  type Sort,
} from "../VaultToolbar/parts";

const CHAIN_ORDER = [
  "Arbitrum",
  "Base",
  "Ethereum",
  "Optimism",
  "Polygon",
  "BNB Chain",
  "Avalanche",
];

export function AllVaultsBrowser({ vaults }: { vaults: Vault[] }) {
  const savedItems = useSavedStore((s) => s.items);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [category, setCategory] = useState("all");
  const [chain, setChain] = useState("");
  const [sort, setSort] = useState<Sort>("tvl");

  const chains = useMemo(() => {
    const rank = (name: string) => {
      const i = CHAIN_ORDER.indexOf(name);
      return i === -1 ? CHAIN_ORDER.length : i;
    };
    return [...new Set(vaults.map((v) => v.chain))].sort(
      (a, b) => rank(a) - rank(b),
    );
  }, [vaults]);

  const filtered = useMemo(() => {
    let list = vaults;
    if (category !== "all") {
      list = list.filter((v) => v.categories.includes(category));
    }
    if (chain) list = list.filter((v) => v.chain === chain);
    if (savedOnly) {
      list = list.filter((v) => savedItems.some((s) => s.id === v.id));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((v) =>
        `${v.protocol.name} ${v.asset} ${v.chain} ${v.name ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }
    return [...list].sort((a, b) =>
      sort === "apy" ? b.apy - a.apy : b.tvlUsd - a.tvlUsd,
    );
  }, [vaults, category, chain, savedOnly, query, sort, savedItems]);

  const filtersActive = !!chain || sort !== "tvl";

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto text-sm">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </Chip>
          {categories.slice(1).map((label) => {
            const slug = label.toLowerCase().replace(/\s+/g, "-");
            return (
              <Chip
                key={label}
                active={category === slug}
                onClick={() => setCategory(slug)}
              >
                {label}
              </Chip>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
          <IconBtn
            label="Search"
            active={searchOpen}
            onClick={() => setSearchOpen((o) => !o)}
          >
            <Search className="size-4" />
          </IconBtn>
          <div className="relative">
            <IconBtn
              label="Filters"
              active={filterOpen || filtersActive}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <SlidersHorizontal className="size-4" />
            </IconBtn>
            <AnimatePresence>
              {filterOpen ? (
                <FilterPopover
                  chains={chains}
                  chain={chain}
                  setChain={setChain}
                  sort={sort}
                  setSort={setSort}
                  onClose={() => setFilterOpen(false)}
                />
              ) : null}
            </AnimatePresence>
          </div>
          <IconBtn
            label="Saved"
            active={savedOnly}
            onClick={() => setSavedOnly((o) => !o)}
          >
            <Bookmark className={`size-4 ${savedOnly ? "fill-current" : ""}`} />
          </IconBtn>
        </div>
      </div>

      <SearchField open={searchOpen} query={query} setQuery={setQuery} />

      <div className="mt-4">
        {filtered.length ? (
          <VaultGrid items={filtered} />
        ) : (
          <Empty savedOnly={savedOnly} />
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}
