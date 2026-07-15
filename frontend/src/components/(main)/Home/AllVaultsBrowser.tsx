"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categories } from "@/lib/mock/earn";
import { useSavedStore } from "@/stores/saved";
import type { Vault } from "@/types/earn";
import { VaultGrid } from "../VaultGrid";

const CHAIN_ORDER = [
  "Arbitrum",
  "Base",
  "Ethereum",
  "Optimism",
  "Polygon",
  "BNB Chain",
  "Avalanche",
];

type Sort = "tvl" | "apy";

export function AllVaultsBrowser({ vaults }: { vaults: Vault[] }) {
  const savedItems = useSavedStore((s) => s.items);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
        <div className="flex flex-1 items-center gap-2 overflow-x-auto text-sm">
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

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
              <Search className="size-4 text-muted-foreground" />
              <input
                // biome-ignore lint/a11y/noAutofocus: user opened the search field
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by protocol, asset or chain..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear"
                  onClick={() => setQuery("")}
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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

function IconBtn({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground ${active ? "bg-muted text-foreground" : ""}`}
    >
      {children}
    </motion.button>
  );
}

function FilterPopover({
  chains,
  chain,
  setChain,
  sort,
  setSort,
  onClose,
}: {
  chains: string[];
  chain: string;
  setChain: (c: string) => void;
  sort: Sort;
  setSort: (s: Sort) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-xl"
      >
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort by
        </p>
        <Option active={sort === "tvl"} onClick={() => setSort("tvl")}>
          Most deposited
        </Option>
        <Option active={sort === "apy"} onClick={() => setSort("apy")}>
          Highest yield
        </Option>
        <div className="my-1 h-px bg-border" />
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Chain
        </p>
        <Option active={chain === ""} onClick={() => setChain("")}>
          All chains
        </Option>
        {chains.map((c) => (
          <Option key={c} active={chain === c} onClick={() => setChain(c)}>
            {c}
          </Option>
        ))}
      </motion.div>
    </>
  );
}

function Option({
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
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
    >
      <span>{children}</span>
      {active ? <Check className="size-4 text-primary" /> : null}
    </button>
  );
}

function Empty({ savedOnly }: { savedOnly: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <p className="font-semibold">
        {savedOnly ? "No saved vaults yet" : "No vaults found"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {savedOnly
          ? "Tap the bookmark on a vault to save it."
          : "Try a different search or filter."}
      </p>
    </div>
  );
}
