"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, X } from "lucide-react";

export type Sort = "tvl" | "apy";

// Shared search/filter/saved toolbar primitives, used by both the home
// All-vaults browser and every category tab so the UX stays identical.

export function IconBtn({
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

export function SearchField({
  open,
  query,
  setQuery,
  placeholder = "Search by protocol, asset or chain...",
}: {
  open: boolean;
  query: string;
  setQuery: (q: string) => void;
  placeholder?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
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
              placeholder={placeholder}
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
  );
}

export function FilterPopover({
  chains,
  chain,
  setChain,
  sort,
  setSort,
  onClose,
}: {
  chains?: string[];
  chain?: string;
  setChain?: (c: string) => void;
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
        className="absolute right-0 z-50 mt-2 w-[min(14rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-surface p-2 shadow-xl"
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
        {chains?.length && setChain ? (
          <>
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
          </>
        ) : null}
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

export function Empty({ savedOnly }: { savedOnly: boolean }) {
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
