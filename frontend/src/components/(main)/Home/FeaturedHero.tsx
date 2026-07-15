import { Bookmark, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { earnPlans } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";
import { VaultAvatar } from "../VaultAvatar";
import { ActivityFeed } from "./ActivityFeed";
import { YieldChart } from "./YieldChart";

const USDC_LOGO = "/Assets/Images/Logo/logo-defi/usdc-logo.webp";
const DOT_CLASS = ["bg-primary", "bg-high", "bg-success"];
const HERO_CHIPS = [earnPlans[0], earnPlans[2]];

function pickFeatured(vaults: Vault[]) {
  const usdc = vaults.filter((v) => v.asset === "USDC");
  const list = usdc.length >= 3 ? usdc : vaults;
  return list.slice(0, 3);
}

export function FeaturedHero({ vaults }: { vaults: Vault[] }) {
  const featured = pickFeatured(vaults);
  const tvl = featured.reduce((sum, vault) => sum + vault.tvlUsd, 0);
  return (
    <div className="flex flex-col gap-3">
      <article className="flex flex-col rounded-2xl border border-border bg-surface p-5">
        <FeaturedTop />
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <FeaturedList featured={featured} tvl={tvl} />
          <FeaturedChart featured={featured} />
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
          src={USDC_LOGO}
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

function FeaturedList({ featured, tvl }: { featured: Vault[]; tvl: number }) {
  return (
    <div className="flex flex-col">
      <ul className="divide-y divide-border">
        {featured.map((vault) => (
          <li
            key={vault.id}
            className="flex items-center gap-3 py-3 first:pt-0"
          >
            <VaultAvatar vault={vault} size={28} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {vault.name || vault.protocol.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {vault.protocol.name} · {vault.chain}
              </p>
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
        <Link
          href="/defi"
          className="block w-full rounded-xl bg-success py-3 text-center text-sm font-semibold text-white shadow-[0_4px_0_0_var(--color-success-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-success-hover)]"
        >
          Start earning
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatCompactUsd(tvl)} TVL
        </p>
      </div>
    </div>
  );
}

function FeaturedChart({ featured }: { featured: Vault[] }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {featured.map((vault, index) => (
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
        <YieldChart featured={featured} />
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
