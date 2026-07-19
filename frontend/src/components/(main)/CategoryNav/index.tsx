"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { categories } from "@/lib/mock/earn";

interface RouteTab {
  label: string;
  href: string;
  icon?: LucideIcon;
}

const ROUTE_TABS: RouteTab[] = [
  { label: "Trending", href: "/", icon: TrendingUp },
  { label: "DeFi", href: "/defi" },
];

const CATEGORY_TABS = categories.slice(1);

export function CategoryNav() {
  const pathname = usePathname();
  const active = useSearchParams().get("category");

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 overflow-x-auto px-4 py-3 text-sm sm:gap-6 sm:px-6">
        {ROUTE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === "/defi" && !active;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {tab.label}
            </Link>
          );
        })}
        {CATEGORY_TABS.map((label) => {
          const slug = label.toLowerCase().replace(/\s+/g, "-");
          const isActive = pathname === "/defi" && active === slug;
          const className =
            label === "New"
              ? `whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`
              : `whitespace-nowrap font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;
          return (
            <Link
              key={label}
              href={`/defi?category=${slug}`}
              className={className}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
