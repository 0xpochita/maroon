"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  LogOut,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type Asset, useAccount } from "@/hooks/useAccount";
import { formatUsd } from "@/lib/format";
import { tokenLogo } from "@/lib/tokens";

function shorten(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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
  const { address, balanceUsd, assets, openDeposit, logout } = useAccount();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
              alt="Maroon"
              width={28}
              height={25}
            />
            <div>
              <h2 className="text-lg font-bold">Maroon Wallet</h2>
              <button
                type="button"
                onClick={copy}
                className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="font-mono">{shorten(address)}</span>
                {copied ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
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

        <div className="mt-6">
          <p className="text-3xl font-bold">
            {formatUsd(balanceUsd ?? 0)}{" "}
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
            onClick={() => {
              onClose();
              openDeposit();
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus className="size-4" />
            Deposit
          </button>
          <button
            type="button"
            disabled
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-60"
          >
            Withdraw
            <ArrowUpRight className="size-4" />
          </button>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assets
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <AssetRow key={asset.tokenType} asset={asset} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No assets yet. Deposit to get started.
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
            Log out
          </button>
          <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            Powered by
            <Image
              src="/Assets/Images/Logo/logo-brands/magic-labs-logo.jpg"
              alt="Magic Labs"
              width={16}
              height={16}
              className="size-4 rounded object-contain"
            />
            Magic Labs
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  const logo = tokenLogo(asset.tokenType);
  return (
    <div className="flex items-center gap-3">
      {logo ? (
        <Image
          src={logo}
          alt={asset.tokenType}
          width={36}
          height={36}
          unoptimized={logo.startsWith("http")}
          className="size-9 rounded-full object-contain"
        />
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold">
          {asset.tokenType.slice(0, 3)}
        </span>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{asset.tokenType}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">
          {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
          {asset.tokenType}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatUsd(asset.amountInUSD)}
        </p>
      </div>
    </div>
  );
}
