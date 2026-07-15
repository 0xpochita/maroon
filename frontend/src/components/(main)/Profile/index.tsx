"use client";

import Image from "next/image";
import { useState } from "react";
import { type Asset, useAccount } from "@/hooks/useAccount";
import { formatUsd } from "@/lib/format";
import { tokenLogo } from "@/lib/tokens";

function shorten(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Profile() {
  const { status, address, balanceUsd, assets, openDeposit, promptLogin } =
    useAccount();

  if (status !== "ready" || !address) {
    return (
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
        <h1 className="text-xl font-semibold">Log in to see your profile</h1>
        <p className="text-sm text-muted-foreground">
          Your Universal Account, balance and activity live here.
        </p>
        <button
          type="button"
          onClick={promptLogin}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)]"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileCard
        address={address}
        balanceUsd={balanceUsd}
        assetCount={assets.length}
        onDeposit={openDeposit}
      />
      <HoldingsSection assets={assets} />
    </div>
  );
}

function ProfileCard({
  address,
  balanceUsd,
  assetCount,
  onDeposit,
}: {
  address: string;
  balanceUsd?: number;
  assetCount: number;
  onDeposit: () => void;
}) {
  const stats = [
    { label: "Balance", value: formatUsd(balanceUsd ?? 0) },
    { label: "Assets", value: String(assetCount) },
    { label: "Networks", value: "All" },
  ];
  return (
    <article className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-4">
        <span className="size-16 rounded-full bg-gradient-to-br from-primary to-warning" />
        <div className="min-w-0">
          <h1 className="truncate font-mono text-xl font-bold">
            {shorten(address)}
          </h1>
          <p className="text-sm text-muted-foreground">Universal Account</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 first:pl-0">
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onDeposit}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)]"
        >
          Deposit
        </button>
        <button
          type="button"
          disabled
          className="flex-1 rounded-xl bg-muted py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-60"
        >
          Withdraw
        </button>
      </div>
    </article>
  );
}

function HoldingsSection({ assets }: { assets: Asset[] }) {
  const [tab, setTab] = useState<"holdings" | "activity">("holdings");
  return (
    <section>
      <div className="flex items-center gap-5 border-b border-border">
        <TabButton
          active={tab === "holdings"}
          onClick={() => setTab("holdings")}
        >
          Holdings
        </TabButton>
        <TabButton
          active={tab === "activity"}
          onClick={() => setTab("activity")}
        >
          Activity
        </TabButton>
      </div>

      {tab === "holdings" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          {assets.length > 0 ? (
            assets.map((asset) => (
              <div
                key={asset.tokenType}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <AssetLogo symbol={asset.tokenType} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{asset.tokenType}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.amount.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}{" "}
                    {asset.tokenType}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatUsd(asset.amountInUSD)}
                </p>
              </div>
            ))
          ) : (
            <EmptyState label="No assets yet. Deposit to start earning." />
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <EmptyState label="No activity yet." />
        </div>
      )}
    </section>
  );
}

function AssetLogo({ symbol }: { symbol: string }) {
  const logo = tokenLogo(symbol);
  if (!logo) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {symbol.slice(0, 3)}
      </span>
    );
  }
  return (
    <Image
      src={logo}
      alt={symbol}
      width={32}
      height={32}
      unoptimized={logo.startsWith("http")}
      className="size-8 shrink-0 rounded-full object-contain"
    />
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 text-sm ${active ? "border-b-2 border-foreground font-semibold" : "font-medium text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="px-4 py-12 text-center text-sm text-muted-foreground">
      {label}
    </p>
  );
}
