import { Bookmark, Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/mock/earn";
import { VaultGrid } from "../VaultGrid";

export function AllVaults() {
  return (
    <section>
      <div className="flex items-center gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Image
            src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
            alt="Maroon"
            width={24}
            height={21}
          />
          All vaults
        </h2>
        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <ToolbarIcon label="Search">
            <Search className="size-4" />
          </ToolbarIcon>
          <ToolbarIcon label="Filters">
            <SlidersHorizontal className="size-4" />
          </ToolbarIcon>
          <ToolbarIcon label="Saved">
            <Bookmark className="size-4" />
          </ToolbarIcon>
        </div>
        <Link
          href="/defi"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Explore all
        </Link>
      </div>
      <div className="mt-4">
        <FilterChips />
      </div>
      <div className="mt-4">
        <VaultGrid />
      </div>
    </section>
  );
}

function ToolbarIcon({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function FilterChips() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto text-sm">
      <span className="rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary">
        All
      </span>
      {categories.slice(1).map((category) => (
        <button
          key={category}
          type="button"
          className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
