"use client";

import Image from "next/image";
import { protocolFilters } from "@/lib/mock/earn";
import { useUiStore } from "@/stores/ui";

export function PromoCard() {
  const openDeposit = useUiStore((s) => s.openDeposit);
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex -space-x-2">
        {protocolFilters.map((protocol) => (
          <Image
            key={protocol.name}
            src={protocol.logo}
            alt={protocol.name}
            width={30}
            height={30}
            className="rounded-full border-2 border-surface bg-surface"
          />
        ))}
      </div>
      <p className="mt-3 font-semibold">Start earning in one tap</p>
      <p className="mt-1 text-sm text-muted-foreground">
        No wallet, gas, or chains. Deposit and earn real DeFi yield.
      </p>
      <button
        type="button"
        onClick={openDeposit}
        className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)]"
      >
        Deposit
      </button>
    </div>
  );
}
