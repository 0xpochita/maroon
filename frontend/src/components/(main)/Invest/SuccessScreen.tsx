"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatPercent, formatUsd } from "@/lib/format";
import { LEG_COLORS } from "@/lib/risk";
import { VaultAvatar } from "../VaultAvatar";
import { AI_NAME } from "./parts";
import type { InvestFlow } from "./useInvest";

const CONFETTI = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  return {
    id: `c${i}`,
    x: Math.cos(angle) * 120,
    y: Math.sin(angle) * 120,
    color: LEG_COLORS[i % LEG_COLORS.length],
  };
});

export function SuccessScreen({ flow }: { flow: InvestFlow }) {
  const plan = flow.plan;
  if (!plan) return null;
  const chains = [...new Set(plan.legs.map((l) => l.vault.chain))].join(", ");

  return (
    <div className="mx-auto w-full max-w-lg pb-28">
      <div className="relative flex flex-col items-center gap-4 py-6 text-center">
        {/* Confetti burst */}
        <div className="pointer-events-none absolute top-8 left-1/2">
          {CONFETTI.map((c) => (
            <motion.span
              key={c.id}
              className="absolute size-2 rounded-sm"
              style={{ background: c.color }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: c.x, y: c.y, opacity: 0, scale: 0.4 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          ))}
        </div>

        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-20 items-center justify-center rounded-full text-primary-foreground"
          style={{
            background:
              "radial-gradient(120% 120% at 30% 25%, var(--color-primary) 0%, var(--color-high) 100%)",
          }}
        >
          <Check className="size-10" strokeWidth={3} />
        </motion.span>

        <h1 className="text-3xl font-semibold">You&apos;re earning.</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {formatUsd(plan.amountUsd)} is now working across {plan.legs.length}{" "}
          {plan.legs.length === 1 ? "vault" : "vaults"}, earning about{" "}
          {formatPercent(plan.blendedApy)} a year.
        </p>
      </div>

      <p className="mb-2 text-xs font-medium text-muted-foreground">
        What you own now
      </p>
      <div className="space-y-2">
        {plan.legs.map((leg) => (
          <div
            key={leg.vault.id}
            className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
          >
            <VaultAvatar vault={leg.vault} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {leg.vault.name ?? leg.vault.protocol.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {leg.vault.chain} · {formatPercent(leg.vault.apy)} APY
              </p>
            </div>
            <span className="font-semibold">{formatUsd(leg.amountUsd)}</span>
          </div>
        ))}
      </div>

      {/* Trust note (no on-chain verifier - plain receipt) */}
      <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary-subtle px-4 py-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">{AI_NAME} placed your plan</p>
          <p className="text-xs text-muted-foreground">
            Deposited across {plan.legs.length}{" "}
            {plan.legs.length === 1 ? "vault" : "vaults"} on {chains}. Track it
            anytime in your portfolio.
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link
            href="/profile"
            className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            View portfolio
          </Link>
          <button
            type="button"
            onClick={flow.reset}
            className="rounded-xl bg-muted px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted-strong"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
