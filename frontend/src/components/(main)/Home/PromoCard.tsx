import Image from "next/image";
import { protocolFilters } from "@/lib/mock/earn";

export function PromoCard() {
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
        className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Deposit
      </button>
    </div>
  );
}
