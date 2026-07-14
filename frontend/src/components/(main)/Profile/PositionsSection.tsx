"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatPercent } from "@/lib/format";
import { chainLogos, vaults } from "@/lib/mock/earn";
import type { Protocol, Vault } from "@/types/earn";

interface Position extends Vault {
  deposited: string;
  value: string;
}

const DEPOSITS = ["$500.00", "$400.00", "$300.00"];
const VALUES = ["$502.30", "$403.10", "$304.80"];
const POSITIONS: Position[] = vaults.slice(0, 3).map((vault, index) => ({
  ...vault,
  deposited: DEPOSITS[index],
  value: VALUES[index],
}));

const [aave, morpho, euler] = vaults.slice(0, 3).map((vault) => vault.protocol);

interface Activity {
  id: string;
  protocol: Protocol;
  chain: string;
  asset: string;
  label: string;
  token: string;
  usd: string;
  tone: "success" | "default";
}

const ACTIVITY: Activity[] = [
  {
    id: "a1",
    protocol: aave,
    chain: "Base",
    asset: "USDC",
    label: "Deposited",
    token: "+500 USDC",
    usd: "$500",
    tone: "default",
  },
  {
    id: "a2",
    protocol: morpho,
    chain: "Base",
    asset: "USDC",
    label: "Yield earned",
    token: "+3.10 USDC",
    usd: "$3.10",
    tone: "success",
  },
  {
    id: "a3",
    protocol: euler,
    chain: "Arbitrum",
    asset: "USDC",
    label: "Deposited",
    token: "+300 USDC",
    usd: "$300",
    tone: "default",
  },
  {
    id: "a4",
    protocol: aave,
    chain: "Base",
    asset: "USDC",
    label: "Withdrawn",
    token: "-100 USDC",
    usd: "$100",
    tone: "default",
  },
  {
    id: "a5",
    protocol: aave,
    chain: "Base",
    asset: "USDC",
    label: "Yield earned",
    token: "+2.30 USDC",
    usd: "$2.30",
    tone: "success",
  },
];

const AMOUNT_TONES: Record<Activity["tone"], string> = {
  success: "text-success",
  default: "text-foreground",
};

export function PositionsSection() {
  const [tab, setTab] = useState<"positions" | "activity">("positions");
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
          active={tab === "activity"}
          onClick={() => setTab("activity")}
        >
          Activity
        </TabButton>
      </div>
      {tab === "positions" ? <PositionsView /> : <ActivityView />}
    </section>
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

function PositionsView() {
  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex rounded-lg bg-muted p-0.5 text-sm">
          <button
            type="button"
            className="rounded-md bg-surface px-3 py-1.5 font-medium shadow-sm"
          >
            Active
          </button>
          <button
            type="button"
            className="px-3 py-1.5 font-medium text-muted-foreground"
          >
            Closed
          </button>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search positions"
            placeholder="Search positions..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium"
        >
          <SlidersHorizontal className="size-4" />
          Value
        </button>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-border bg-muted px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Vault</span>
          <span>APY</span>
          <span>Deposited</span>
          <span className="text-right">Value</span>
        </div>
        {POSITIONS.map((position) => (
          <PositionRow key={position.id} position={position} />
        ))}
      </div>
    </>
  );
}

function PositionRow({ position }: { position: Position }) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <ProtocolLogo
          protocol={position.protocol}
          chain={position.chain}
          size={32}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">{position.asset}</p>
          <p className="text-xs text-muted-foreground">
            {position.protocol.name} · {position.chain}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-success">
        {formatPercent(position.apy)}
      </span>
      <span className="text-sm">{position.deposited}</span>
      <span className="text-right text-sm font-medium">{position.value}</span>
    </div>
  );
}

function ActivityView() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border">
      {ACTIVITY.map((item) => (
        <ActivityRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <ProtocolLogo protocol={item.protocol} chain={item.chain} size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.asset}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${AMOUNT_TONES[item.tone]}`}>
          {item.token}
        </p>
        <p className="text-xs text-muted-foreground">{item.usd}</p>
      </div>
    </div>
  );
}

function ProtocolLogo({
  protocol,
  chain,
  size,
}: {
  protocol: Protocol;
  chain: string;
  size: number;
}) {
  const badge = Math.round(size * 0.44);
  return (
    <span className="relative shrink-0">
      <Image
        src={protocol.logo}
        alt={protocol.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full object-contain"
      />
      {chainLogos[chain] ? (
        <Image
          src={chainLogos[chain]}
          alt={chain}
          width={badge}
          height={badge}
          style={{ width: badge, height: badge }}
          className="absolute -right-0.5 -bottom-0.5 rounded-full border border-surface object-cover"
        />
      ) : null}
    </span>
  );
}
