"use client";

import { AnimatePresence } from "framer-motion";
import { Bookmark, Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
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

// Owns the header, the search/sort/saved toolbar and the results grid so the
// toolbar icons sit inline with the title (no empty band). Chain is handled by
// the sidebar, so the filter popover only sorts. Items arrive already filtered
// by category and chain from the URL.
export function BrowserResults({
  items,
  title,
  sidebar,
}: {
  items: Vault[];
  title: string;
  sidebar: React.ReactNode;
}) {
  const savedItems = useSavedStore((s) => s.items);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("tvl");

  const filtered = useMemo(() => {
    let list = items;
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
  }, [items, savedOnly, query, sort, savedItems]);

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
              alt="Maroon"
              width={28}
              height={25}
            />
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} vault{items.length === 1 ? "" : "s"} · Earn in one
            tap.
          </p>
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
              active={filterOpen || sort !== "tvl"}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <SlidersHorizontal className="size-4" />
            </IconBtn>
            <AnimatePresence>
              {filterOpen ? (
                <FilterPopover
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

      <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
        {sidebar}
        <div>
          {filtered.length ? (
            <VaultGrid items={filtered} />
          ) : (
            <Empty savedOnly={savedOnly} />
          )}
        </div>
      </div>
    </section>
  );
}
