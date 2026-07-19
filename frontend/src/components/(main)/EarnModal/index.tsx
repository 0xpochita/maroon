"use client";

import { motion } from "framer-motion";
import { Check, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { explorerTx, lifiScanTx, shortenHash } from "@/lib/explorers";
import { formatAmount, formatPercent, formatUsd } from "@/lib/format";
import { PAY_TOKENS, payToken } from "@/lib/pay-tokens";
import { tokenLogo } from "@/lib/tokens";
import { useAccountStore } from "@/stores/account";
import type { Vault } from "@/types/earn";
import { VaultAvatar } from "../VaultAvatar";

export function EarnModal({
  vault,
  onClose,
}: {
  vault: Vault;
  onClose: () => void;
}) {
  const deposit = useAccountStore((s) => s.deposit);
  const assets = useAccountStore((s) => s.assets);
  const initialToken = PAY_TOKENS.some((t) => t.symbol === vault.asset)
    ? vault.asset
    : "USDC";
  const [token, setToken] = useState(initialToken);
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const [txId, setTxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const pt = payToken(token);
  const parsed = Number(amount) || 0;
  const yearly = (parsed * vault.apy) / 100;
  const crossChain = token !== vault.asset;
  const amountLabel = pt.stable
    ? formatUsd(parsed)
    : `${formatAmount(parsed)} ${pt.symbol}`;
  const held = assets.find((a) => a.tokenType === token);
  const available = held?.amount ?? 0;
  const availableLabel = pt.stable
    ? formatUsd(held?.amountInUSD ?? 0)
    : `${formatAmount(available)} ${pt.symbol}`;

  const selectToken = (symbol: string) => {
    setToken(symbol);
    setAmount("");
  };

  const confirm = async () => {
    setSubmitting(true);
    setError(undefined);
    const res = await deposit(vault, parsed, token);
    setSubmitting(false);
    if (res.ok) {
      setTxId(res.id ?? "");
      setDone(true);
    } else {
      setError(res.error ?? "Deposit failed");
    }
  };

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
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-6 shadow-xl"
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
          <Success
            vault={vault}
            amount={amountLabel}
            txHash={txId}
            onClose={onClose}
          />
        ) : (
          <>
            <Identity vault={vault} />

            <div className="mt-6 flex items-center justify-between">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <span className="text-xs text-muted-foreground">
                Available: {availableLabel}
                {available > 0 ? (
                  <button
                    type="button"
                    onClick={() => setAmount(String(available))}
                    className="ml-2 font-semibold text-primary"
                  >
                    Max
                  </button>
                ) : null}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-border px-4 py-4">
              <TokenLogo symbol={pt.symbol} size={28} />
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  // keep digits + a single decimal point; strip leading zeros
                  // so "0" is replaced when the user types a real amount.
                  let next = event.target.value.replace(/[^\d.]/g, "");
                  const dot = next.indexOf(".");
                  if (dot !== -1) {
                    next =
                      next.slice(0, dot + 1) +
                      next.slice(dot + 1).replace(/\./g, "");
                  }
                  next = next.replace(/^0+(?=\d)/, "");
                  setAmount(next);
                }}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground"
              />
              <span className="shrink-0 text-sm text-muted-foreground">
                {pt.stable ? "Enter amount" : pt.symbol}
              </span>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Pay with</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {PAY_TOKENS.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => selectToken(t.symbol)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${token === t.symbol ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    <TokenLogo symbol={t.symbol} size={18} />
                    {t.symbol}
                  </button>
                ))}
              </div>
              {crossChain ? (
                <p className="mt-2 rounded-lg bg-primary-subtle px-3 py-2 text-xs text-primary">
                  Cross-chain deposit · your {token} auto-converts to{" "}
                  {vault.asset} on {vault.chain}. Routed by LI.FI + Universal
                  Accounts.
                </p>
              ) : null}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <Row
                label="Estimated yield"
                value={`${formatPercent(vault.apy)} / year`}
                accent
              />
              <Row
                label="You could earn"
                value={
                  pt.stable
                    ? `~${formatUsd(yearly)} / year`
                    : `~${formatAmount(yearly)} ${pt.symbol} / year`
                }
                accent
              />
              <Row label="Network fee" value="Free" />
              <Row label="Network" value={vault.chain} />
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-warning-subtle px-3 py-2 text-center text-xs text-warning">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={confirm}
              disabled={parsed <= 0 || submitting}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)] disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? "Depositing..." : "Confirm deposit"}
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

function TokenLogo({ symbol, size = 18 }: { symbol: string; size?: number }) {
  const logo = tokenLogo(symbol);
  if (!logo) {
    return <span className="text-xs font-bold">{symbol.slice(0, 2)}</span>;
  }
  return (
    <Image
      src={logo}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-contain"
      unoptimized={logo.startsWith("http")}
    />
  );
}

const SUCCESS_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};
const SUCCESS_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function Success({
  vault,
  amount,
  txHash,
  onClose,
}: {
  vault: Vault;
  amount: string;
  txHash?: string;
  onClose: () => void;
}) {
  const explorer = explorerTx(vault.chainId, txHash);
  const lifi = lifiScanTx(txHash);
  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-4 text-center"
      variants={SUCCESS_STAGGER}
      initial="hidden"
      animate="show"
    >
      <motion.span
        className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 18,
          delay: 0.05,
        }}
      >
        <Check className="size-7" />
      </motion.span>
      <motion.h2 variants={SUCCESS_ITEM} className="text-xl font-semibold">
        Deposit confirmed
      </motion.h2>
      <motion.p
        variants={SUCCESS_ITEM}
        className="text-sm text-muted-foreground"
      >
        {amount} is now earning {formatPercent(vault.apy)} on{" "}
        {vault.protocol.name}.
      </motion.p>

      {txHash ? (
        <motion.div
          variants={SUCCESS_ITEM}
          className="w-full rounded-xl border border-border bg-muted/40 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Transaction</span>
            <span className="font-mono text-xs">{shortenHash(txHash)}</span>
          </div>
          <div className="mt-2 flex gap-2">
            {lifi ? <TxLink href={lifi} label="LI.FI Scan" /> : null}
            {explorer ? (
              <TxLink href={explorer.url} label={explorer.name} />
            ) : null}
          </div>
        </motion.div>
      ) : null}

      <motion.div variants={SUCCESS_ITEM} className="mt-2 flex gap-2">
        <Link
          href="/profile"
          onClick={onClose}
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
      </motion.div>
    </motion.div>
  );
}

function TxLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
    >
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}
