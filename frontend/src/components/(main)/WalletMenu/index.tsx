"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Copy, Plus, Wallet, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatUsd } from "@/lib/format";
import { portfolio } from "@/lib/mock/earn";

const ADDRESS = "0x3f..a1";
const USDC_LOGO = "/Assets/Images/Logo/logo-defi/usdc-logo.webp";

const ACTIVITY = [
  { label: "Deposited", amount: "+$500", positive: true },
  { label: "Earned", amount: "+$12.40", positive: true },
  { label: "Withdrew", amount: "-$250", positive: false },
];

export function WalletMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Wallet"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
      >
        <Wallet className="size-5" />
      </button>
      <AnimatePresence>
        {open ? <WalletDrawer onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

function WalletDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        aria-label="Close wallet"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-surface p-6 shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
      >
        <WalletHeader onClose={onClose} />
        <WalletBalance />
        <WalletSection title="Assets">
          <AssetRow />
        </WalletSection>
        <WalletSection title="Activity">
          {ACTIVITY.map((item) => (
            <ActivityRow key={item.label} item={item} />
          ))}
        </WalletSection>
        <p className="mt-auto pt-6 text-xs text-muted-foreground">
          Questions? Reach us at{" "}
          <a
            href="mailto:support@maroon.fi"
            className="font-medium text-primary"
          >
            support@maroon.fi
          </a>
        </p>
      </motion.aside>
    </div>
  );
}

function WalletHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Maroon Wallet</h2>
          <span className="text-xs text-muted-foreground">{ADDRESS}</span>
          <Copy className="size-3.5 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your deposits and yield live here.
        </p>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function WalletBalance() {
  return (
    <>
      <div className="mt-6">
        <p className="text-3xl font-bold">
          {formatUsd(portfolio.totalUsd)}{" "}
          <span className="text-base font-medium text-muted-foreground">
            USD
          </span>
        </p>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Balance
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="size-4" />
          Deposit
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted py-2.5 text-sm font-semibold transition-colors hover:bg-muted-strong"
        >
          Withdraw
          <ArrowUpRight className="size-4" />
        </button>
      </div>
    </>
  );
}

function WalletSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function AssetRow() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={USDC_LOGO}
        alt="USDC"
        width={36}
        height={36}
        className="size-9 rounded-full object-contain"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">USDC</p>
        <p className="text-xs text-muted-foreground">USD Coin</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">1,284.52 USDC</p>
        <p className="text-xs text-muted-foreground">
          {formatUsd(portfolio.totalUsd)}
        </p>
      </div>
    </div>
  );
}

function ActivityRow({
  item,
}: {
  item: { label: string; amount: string; positive: boolean };
}) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={USDC_LOGO}
        alt="USDC"
        width={36}
        height={36}
        className="size-9 rounded-full object-contain"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">USDC</p>
      </div>
      <p
        className={`text-sm font-semibold ${item.positive ? "text-success" : "text-foreground"}`}
      >
        {item.amount}
      </p>
    </div>
  );
}
