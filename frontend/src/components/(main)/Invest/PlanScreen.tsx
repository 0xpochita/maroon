"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import { formatPercent, formatUsd } from "@/lib/format";
import { riskMeta } from "@/lib/risk";
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
  if (!plan) return null;
  const meta = riskMeta(plan.riskScore);

  return (
    <div className="mx-auto w-full max-w-lg pb-28">
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

      {/* Pinned invest bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            No fees · gas on us
          </p>
          <button
            type="button"
            onClick={flow.place}
            disabled={flow.rethinking || flow.busy}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)] disabled:opacity-50 disabled:shadow-none"
          >
            {flow.busy ? "Securing…" : `Deposit ${formatUsd(plan.amountUsd)}`}
          </button>
        </div>
      </div>
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
