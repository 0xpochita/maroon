import { Bookmark, Share2 } from "lucide-react";
import Image from "next/image";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { earnPlans, vaults } from "@/lib/mock/earn";
import { ActivityFeed } from "./ActivityFeed";
import { YieldChart } from "./YieldChart";

const FEATURED = vaults.slice(0, 3);
const DOT_CLASS = ["bg-primary", "bg-high", "bg-success"];
const FEATURED_TVL = FEATURED.reduce((sum, vault) => sum + vault.tvlUsd, 0);
const HERO_CHIPS = [earnPlans[0], earnPlans[2]];

export function FeaturedHero() {
  return (
    <div className="flex flex-col gap-3">
      <article className="flex flex-col rounded-2xl border border-border bg-surface p-5">
        <FeaturedTop />
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <FeaturedList />
          <FeaturedChart />
        </div>
      </article>
      <FeaturedFooter />
    </div>
  );
}

function FeaturedTop() {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Image
          src={FEATURED[0].assetLogo}
          alt="USDC"
          width={44}
          height={44}
          className="size-11 rounded-xl object-contain"
        />
        <div>
          <p className="text-xs text-muted-foreground">
            Stablecoin yield · USDC
          </p>
          <h2 className="text-lg font-bold">Top USDC vaults</h2>
        </div>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <button
          type="button"
          aria-label="Share"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground"
        >
          <Share2 className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Save"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bookmark className="size-4" />
        </button>
      </div>
    </div>
  );
}

function FeaturedList() {
  return (
    <div className="flex flex-col">
      <ul className="divide-y divide-border">
        {FEATURED.map((vault) => (
          <li
            key={vault.id}
            className="flex items-center gap-3 py-3 first:pt-0"
          >
            <Image
              src={vault.protocol.logo}
              alt={vault.protocol.name}
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{vault.protocol.name}</p>
              <p className="text-xs text-muted-foreground">{vault.chain}</p>
            </div>
            <span className="text-lg font-bold text-success">
              {formatPercent(vault.apy)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </p>
        <ActivityFeed />
      </div>
      <div className="mt-5">
        <button
          type="button"
          className="w-full rounded-xl bg-success py-3 text-sm font-semibold text-white shadow-[0_4px_0_0_var(--color-success-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-success-hover)]"
        >
          Start earning
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatCompactUsd(FEATURED_TVL)} TVL
        </p>
      </div>
    </div>
  );
}

function FeaturedChart() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {FEATURED.map((vault, index) => (
          <span key={vault.id} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${DOT_CLASS[index]}`} />
            {vault.protocol.name}
            <span className="font-semibold text-foreground">
              {formatPercent(vault.apy)}
            </span>
          </span>
        ))}
      </div>
      <div className="mt-3 min-h-48 flex-1">
        <YieldChart />
      </div>
    </div>
  );
}

function FeaturedFooter() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-5 rounded-full bg-foreground" />
        {["a", "b", "c"].map((dot) => (
          <span key={dot} className="size-1.5 rounded-full bg-border" />
        ))}
      </div>
      <div className="flex gap-2">
        {HERO_CHIPS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {plan.name} · {formatPercent(plan.apy)}
          </button>
        ))}
      </div>
    </div>
  );
}
