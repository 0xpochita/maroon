"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPercent } from "@/lib/format";
import { type SavedVault, useSavedStore } from "@/stores/saved";

export function SavedMenu() {
  const items = useSavedStore((s) => s.items);
  const toggle = useSavedStore((s) => s.toggle);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Saved vaults"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
      >
        <Bookmark className="size-5" />
        {items.length ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {items.length}
          </span>
        ) : null}
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="font-semibold">Saved vaults</p>
                <span className="text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              {items.length ? (
                <ul className="max-h-80 overflow-y-auto">
                  {items.map((vault) => (
                    <SavedRow
                      key={vault.id}
                      vault={vault}
                      onOpen={() => setOpen(false)}
                      onRemove={() => toggle(vault)}
                    />
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-10 text-center">
                  <Bookmark className="mx-auto size-6 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No saved vaults</p>
                  <p className="text-xs text-muted-foreground">
                    Tap the bookmark on a vault to save it.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SavedRow({
  vault,
  onOpen,
  onRemove,
}: {
  vault: SavedVault;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-2 border-b border-border px-3 py-3 last:border-b-0">
      <Link
        href={`/vault/${vault.id}`}
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-muted"
      >
        {vault.logo ? (
          <Image
            src={vault.logo}
            alt={vault.protocol}
            width={32}
            height={32}
            unoptimized={vault.logo.startsWith("http")}
            className="size-8 shrink-0 rounded-full object-contain"
          />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
            {vault.protocol.slice(0, 2)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {vault.name || vault.protocol}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {vault.protocol} · {vault.chain}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-success">
          {formatPercent(vault.apy)}
        </span>
      </Link>
      <button
        type="button"
        aria-label="Remove"
        onClick={onRemove}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}
