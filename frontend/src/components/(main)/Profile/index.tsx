"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatUsd } from "@/lib/format";
import { getPositions, type Position } from "@/lib/lifi";
import { tokenLogo } from "@/lib/tokens";
import { type Asset, useAccountStore } from "@/stores/account";
import { useUiStore } from "@/stores/ui";

function shorten(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Profile() {
  const status = useAccountStore((s) => s.status);
  const address = useAccountStore((s) => s.address);
  const balanceUsd = useAccountStore((s) => s.balanceUsd);
  const assets = useAccountStore((s) => s.assets);
  const openDeposit = useUiStore((s) => s.openDeposit);
  const openAuth = useUiStore((s) => s.openAuth);

  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  useEffect(() => {
    if (!address) return;
    let active = true;
    setLoadingPositions(true);
    getPositions(address)
      .then((p) => active && setPositions(p))
      .finally(() => active && setLoadingPositions(false));
    return () => {
      active = false;
    };
  }, [address]);

  const { deposited, blendedApy } = useMemo(() => {
    const total = positions.reduce((s, p) => s + p.balanceUsd, 0);
    const apy =
      total > 0
        ? positions.reduce((s, p) => s + p.balanceUsd * (p.apy ?? 0), 0) / total
        : 0;
    return { deposited: total, blendedApy: apy };
  }, [positions]);

  if (status !== "ready" || !address) {
    return (
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
        <h1 className="text-xl font-semibold">Log in to see your profile</h1>
        <p className="text-sm text-muted-foreground">
          Your Universal Account, positions and activity live here.
        </p>
        <button
          type="button"
          onClick={() => openAuth("login")}
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
        deposited={deposited}
        blendedApy={blendedApy}
        onDeposit={openDeposit}
      />
      <ActivitySection
        positions={positions}
        assets={assets}
        loadingPositions={loadingPositions}
      />
    </div>
  );
}

function ProfileCard({
  address,
  balanceUsd,
  deposited,
  blendedApy,
  onDeposit,
}: {
  address: string;
  balanceUsd?: number;
  deposited: number;
  blendedApy: number;
  onDeposit: () => void;
}) {
  const stats = [
    { label: "Balance", value: formatUsd(balanceUsd ?? 0) },
    { label: "Deposited", value: formatUsd(deposited) },
    {
      label: "Blended APY",
      value: blendedApy > 0 ? `${blendedApy.toFixed(2)}%` : "-",
    },
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
          <div key={stat.label} className="px-3 first:pl-0 sm:px-4">
            <p className="text-base font-bold sm:text-lg">{stat.value}</p>
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

type Tab = "positions" | "holdings" | "activity";

function ActivitySection({
  positions,
  assets,
  loadingPositions,
}: {
  positions: Position[];
  assets: Asset[];
  loadingPositions: boolean;
}) {
  const [tab, setTab] = useState<Tab>("positions");
  return (
    <section>
      <div className="flex items-center gap-5 border-b border-border">
        <TabButton
          active={tab === "positions"}
          onClick={() => setTab("positions")}
        >
          Positions
        </TabButton>
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

      {tab === "positions" ? (
        <PositionsPanel positions={positions} loading={loadingPositions} />
      ) : tab === "holdings" ? (
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

function PositionsPanel({
  positions,
  loading,
}: {
  positions: Position[];
  loading: boolean;
}) {
  if (loading && positions.length === 0) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <EmptyState label="Loading your positions..." />
      </div>
    );
  }
  if (positions.length === 0) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <EmptyState label="No positions yet. Deposit to start earning." />
      </div>
    );
  }
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border">
      {positions.map((position) => (
        <div
          key={`${position.chainId}-${position.vaultAddress}`}
          className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <PositionLogo logo={position.logo} label={position.protocol} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {position.name ?? position.protocol}
            </p>
            <p className="text-xs text-muted-foreground">
              {position.protocol} · {position.chain}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {formatUsd(position.balanceUsd)}
            </p>
            {position.apy ? (
              <p className="text-xs font-medium text-success">
                {position.apy.toFixed(2)}% APY
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function PositionLogo({ logo, label }: { logo: string; label: string }) {
  if (!logo) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {label.slice(0, 2)}
      </span>
    );
  }
  return (
    <Image
      src={logo}
      alt={label}
      width={32}
      height={32}
      unoptimized={logo.startsWith("http")}
      className="size-8 shrink-0 rounded-full object-contain"
    />
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
