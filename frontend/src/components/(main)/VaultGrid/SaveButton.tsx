"use client";

import { Bookmark } from "lucide-react";
import { useSaved } from "@/lib/saved";
import type { Vault } from "@/types/earn";

export function SaveButton({ vault }: { vault: Vault }) {
  const { has, toggle } = useSaved();
  const saved = has(vault.id);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save vault"}
      onClick={() =>
        toggle({
          id: vault.id,
          name: vault.name,
          protocol: vault.protocol.name,
          chain: vault.chain,
          apy: vault.apy,
          logo: vault.protocol.logo,
        })
      }
      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted ${saved ? "text-primary" : "text-muted-foreground"}`}
    >
      <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
