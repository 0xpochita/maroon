"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatPercent, formatUsd } from "@/lib/format";
import type { Vault } from "@/types/earn";
import { VaultAvatar } from "../VaultAvatar";

const CHIPS = [5, 10, 100, 200, 500];

export function EarnButton({
  vault,
  className,
  children,
}: {
  vault: Vault;
  className: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <AnimatePresence>
        {open ? (
          <EarnModal vault={vault} onClose={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function EarnModal({ vault, onClose }: { vault: Vault; onClose: () => void }) {
  const [amount, setAmount] = useState("100");
  const [done, setDone] = useState(false);
  const parsed = Number(amount) || 0;
  const yearly = (parsed * vault.apy) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {done ? (
          <Success vault={vault} amount={parsed} onClose={onClose} />
        ) : (
          <>
            <Identity vault={vault} />

            <label htmlFor="amount" className="mt-6 block text-sm font-medium">
              Amount
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-border px-4 py-4">
              <span className="text-2xl font-bold text-muted-foreground">
                $
              </span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(event) => {
                  const next = event.target.value;
                  if (/^\d*$/.test(next)) {
                    setAmount(next);
                  }
                }}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground"
              />
              <span className="shrink-0 text-sm text-muted-foreground">
                Enter amount
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setAmount(String(chip))}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${parsed === chip ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {formatUsd(chip)}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <Row
                label="Estimated yield"
                value={`${formatPercent(vault.apy)} / year`}
                accent
              />
              <Row
                label="You could earn"
                value={`~${formatUsd(yearly)} / year`}
                accent
              />
              <Row label="Network fee" value="Free" />
              <Row label="Network" value={vault.chain} />
            </div>

            <button
              type="button"
              onClick={() => setDone(true)}
              disabled={parsed <= 0}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)] disabled:opacity-50"
            >
              Confirm deposit
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              One tap. No gas, no chains to manage.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Identity({ vault }: { vault: Vault }) {
  return (
    <div className="flex items-center gap-3">
      <VaultAvatar vault={vault} />
      <div>
        <p className="font-semibold">{vault.protocol.name}</p>
        <p className="text-sm text-muted-foreground">
          {vault.chain} · {formatPercent(vault.apy)} APY
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-success" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

function Success({
  vault,
  amount,
  onClose,
}: {
  vault: Vault;
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
        <Check className="size-7" />
      </span>
      <h2 className="text-xl font-semibold">Deposit confirmed</h2>
      <p className="text-sm text-muted-foreground">
        {formatUsd(amount)} is now earning {formatPercent(vault.apy)} on{" "}
        {vault.protocol.name}.
      </p>
      <div className="mt-2 flex gap-2">
        <Link
          href="/profile"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          View portfolio
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-muted px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted-strong"
        >
          Done
        </button>
      </div>
    </div>
  );
}
