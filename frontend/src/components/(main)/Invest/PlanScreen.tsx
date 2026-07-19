"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Info, X } from "lucide-react";
import { useState } from "react";
import { formatPercent, formatUsd } from "@/lib/format";
import { riskMeta } from "@/lib/risk";
import { useAccountStore } from "@/stores/account";
import type { PlanLeg } from "@/types/invest";
import { VaultAvatar } from "../VaultAvatar";
import {
  AI_NAME,
  AiOrb,
  AllocationBar,
  RiskMeter,
  ThinkingDots,
} from "./parts";
import type { InvestFlow, Tone } from "./useInvest";

const NUDGES: { id: Tone; label: string }[] = [
  { id: "balanced", label: "Balanced" },
  { id: "safer", label: "Make it safer" },
  { id: "bolder", label: "Chase more yield" },
  { id: "simple", label: "Keep it simple" },
];

export function PlanScreen({ flow }: { flow: InvestFlow }) {
  const { plan } = flow;
  const balanceUsd = useAccountStore((s) => s.balanceUsd) ?? 0;
  const [showSim, setShowSim] = useState(false);
  if (!plan) return null;
  const meta = riskMeta(plan.riskScore);
  const insufficient = balanceUsd < plan.amountUsd;

  return (
    <div className="mx-auto w-full max-w-lg pb-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={flow.back}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <AiOrb size={26} spin />
        <h1 className="text-xl font-semibold">{AI_NAME}&apos;s plan</h1>
      </div>

      {/* Note bubble */}
      <div className="mt-5 flex gap-3">
        <AiOrb size={34} />
        <div className="flex-1 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 text-sm">
          {flow.rethinking ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <ThinkingDots /> Rethinking your plan…
            </span>
          ) : (
            <>
              <p className="text-muted-foreground">
                Here&apos;s what I&apos;d do with {formatUsd(plan.amountUsd)}.
              </p>
              <p className="mt-1 font-semibold">{plan.summary}</p>
              <p className="mt-1 text-muted-foreground">{plan.rationale}</p>
            </>
          )}
        </div>
      </div>

      {/* Nudge chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {NUDGES.map((n) => {
          const on = flow.tone === n.id;
          return (
            <button
              key={n.id}
              type="button"
              disabled={flow.rethinking || flow.busy}
              onClick={() => flow.nudge(n.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {n.label}
            </button>
          );
        })}
      </div>

      {/* Basket (blurs while rethinking) */}
      <motion.div
        animate={{
          filter: flow.rethinking ? "blur(5px)" : "blur(0px)",
          opacity: flow.rethinking ? 0.55 : 1,
        }}
        transition={{ duration: 0.34 }}
        className="mt-5"
      >
        <AllocationBar legs={plan.legs} />

        <div className="mt-4 space-y-2">
          {plan.legs.map((leg) => (
            <LegCard key={leg.vault.id} leg={leg} />
          ))}
        </div>

        {/* Blended yield */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-success-subtle px-4 py-3 text-sm">
          <span className="text-muted-foreground">Blended yield</span>
          <span className="font-semibold text-success">
            ~{formatPercent(plan.blendedApy)} / year
          </span>
        </div>

        {/* Risk card */}
        <div className="mt-3 rounded-xl border border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              How bumpy this could feel
            </span>
            <span className="text-sm font-semibold text-primary">
              {meta.word}
            </span>
          </div>
          <div className="mt-3">
            <RiskMeter level={meta.level} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Yields move and vaults carry smart-contract risk. Only deposit what
            you can leave for a while.
          </p>
        </div>

        {plan.notes?.length ? (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {plan.notes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        ) : null}
      </motion.div>

      {flow.error ? (
        <p className="mt-4 rounded-lg bg-warning-subtle px-3 py-2 text-center text-xs text-warning">
          {flow.error}
        </p>
      ) : null}

      {/* Invest CTA (inline) */}
      <div className="mt-6">
        <p className="mb-2 text-center text-xs text-muted-foreground">
          No fees · gas on us · paying from {formatUsd(balanceUsd)} balance
        </p>
        <button
          type="button"
          onClick={() => setShowSim(true)}
          disabled={flow.rethinking || flow.busy || insufficient}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)] disabled:opacity-50 disabled:shadow-none"
        >
          {insufficient
            ? `Insufficient balance (${formatUsd(balanceUsd)})`
            : `Deposit ${formatUsd(plan.amountUsd)}`}
        </button>
      </div>

      <AnimatePresence>
        {showSim ? (
          <SimModal
            flow={flow}
            balanceUsd={balanceUsd}
            insufficient={insufficient}
            onClose={() => setShowSim(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Deposit simulation: previews the per-vault split, total and balance check
// before running the real multi-leg deposit. Confirm is disabled when the
// unified balance can't cover the plan.
function SimModal({
  flow,
  balanceUsd,
  insufficient,
  onClose,
}: {
  flow: InvestFlow;
  balanceUsd: number;
  insufficient: boolean;
  onClose: () => void;
}) {
  const { plan } = flow;
  if (!plan) return null;
  const chains = new Set(plan.legs.map((l) => l.vault.chain)).size;
  const confirm = () => {
    onClose();
    flow.place();
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Review deposit</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulating {plan.legs.length} deposits across {chains} chain
          {chains === 1 ? "" : "s"} via your Universal Account.
        </p>

        <div className="mt-4 space-y-2">
          {plan.legs.map((leg) => (
            <div
              key={leg.vault.id}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <VaultAvatar vault={leg.vault} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {leg.vault.name ?? leg.vault.protocol.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {leg.vault.chain} · {formatPercent(leg.vault.apy)} APY
                </p>
              </div>
              <p className="text-sm font-medium">{formatUsd(leg.amountUsd)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <SimRow label="Total deposit" value={formatUsd(plan.amountUsd)} />
          <SimRow label="Paying from balance" value={formatUsd(balanceUsd)} />
          <SimRow
            label="Blended yield"
            value={`~${formatPercent(plan.blendedApy)} / year`}
            accent
          />
          <SimRow label="Network fee" value="Free · gas on us" />
        </div>

        {insufficient ? (
          <p className="mt-4 rounded-lg bg-warning-subtle px-3 py-2 text-center text-xs text-warning">
            Balance too low. You need {formatUsd(plan.amountUsd)} but have{" "}
            {formatUsd(balanceUsd)}.
          </p>
        ) : null}

        <button
          type="button"
          onClick={confirm}
          disabled={insufficient || flow.busy}
          className="mt-5 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)] disabled:opacity-50 disabled:shadow-none"
        >
          {insufficient
            ? "Insufficient balance"
            : `Confirm deposit ${formatUsd(plan.amountUsd)}`}
        </button>
      </motion.div>
    </div>
  );
}

function SimRow({
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

function LegCard({ leg }: { leg: PlanLeg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <VaultAvatar vault={leg.vault} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {leg.vault.name ?? leg.vault.protocol.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {leg.vault.chain} · {formatPercent(leg.vault.apy)} APY
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatUsd(leg.amountUsd)}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(leg.weightPct)}%
          </p>
        </div>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
        {leg.reason}
      </p>
    </motion.div>
  );
}
