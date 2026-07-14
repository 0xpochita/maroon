import Image from "next/image";
import { protocolFilters, totalVaultCount } from "@/lib/mock/earn";

export function FilterSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
      <button
        type="button"
        className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5 text-sm font-semibold"
      >
        <span>All</span>
        <span className="text-muted-foreground">{totalVaultCount}</span>
      </button>
      <p className="mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Protocols
      </p>
      {protocolFilters.map((filter) => (
        <button
          key={filter.name}
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Image
            src={filter.logo}
            alt={filter.name}
            width={22}
            height={22}
            className="rounded-full"
          />
          <span>{filter.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {filter.count}
          </span>
        </button>
      ))}
    </aside>
  );
}
