"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/mock/earn";

interface Tab {
  label: string;
  href: string;
  icon?: LucideIcon;
}

const TABS: Tab[] = [
  { label: "Trending", href: "/", icon: TrendingUp },
  { label: "DeFi", href: "/defi" },
];

export function CategoryNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-6 py-3 text-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {tab.label}
            </Link>
          );
        })}
        {categories.slice(1).map((category) => (
          <button
            key={category}
            type="button"
            className="whitespace-nowrap font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}
