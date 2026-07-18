"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import { useAccountStore } from "@/stores/account";
import { AI_NAME, AiOrb, AiTag } from "./parts";
import type { InvestFlow } from "./useInvest";

const SUGGESTIONS = [
  "Earn steady yield on $500, keep it safe",
  "Grow $300 with a mix of safe and higher yield",
  "Go for the highest yield you can find",
  "A little of everything to start",
];

export function GoalScreen({ flow }: { flow: InvestFlow }) {
  const balanceUsd = useAccountStore((s) => s.balanceUsd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto flex w-full max-w-lg flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <AiTag />
        <Link
          href="/"
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-5" />
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">
          What are you
          <br />
          hoping to do?
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Say it however feels natural. No DeFi words needed, {AI_NAME} handles
          the rest.
        </p>
      </div>

      <div>
        <label
          htmlFor="invest-amount"
          className="text-xs font-medium text-muted-foreground"
        >
          How much to deposit
        </label>
        <div className="mt-2 flex items-baseline gap-2 rounded-xl border border-border px-4 py-3">
          <span className="text-2xl font-bold text-muted-foreground">$</span>
          <input
            id="invest-amount"
            type="text"
            inputMode="decimal"
            aria-label="Amount to deposit"
            value={flow.amountUsd ? String(flow.amountUsd) : ""}
            onChange={(e) => {
              const next = e.target.value;
              if (/^\d*\.?\d*$/.test(next))
                flow.setAmountUsd(Number(next) || 0);
            }}
            placeholder="0"
            className="min-w-0 flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground"
          />
          {balanceUsd ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              of {formatUsd(balanceUsd)}
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="invest-goal"
          className="text-xs font-medium text-muted-foreground"
        >
          Your goal
        </label>
        <textarea
          id="invest-goal"
          rows={3}
          aria-label="Your goal"
          value={flow.goal}
          onChange={(e) => flow.setGoal(e.target.value)}
          placeholder="e.g. Grow this over time, mostly steady, but reach for a bit more yield…"
          className="mt-2 w-full resize-none rounded-xl border border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => {
          const on = flow.goal.trim() === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => flow.setGoal(s)}
              className={`rounded-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {flow.error ? (
        <p className="rounded-lg bg-warning-subtle px-3 py-2 text-center text-xs text-warning">
          {flow.error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={flow.start}
        disabled={!flow.ready}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-primary-hover)] disabled:opacity-50 disabled:shadow-none"
      >
        <AiOrb size={22} />
        Build my plan
      </button>
    </motion.div>
  );
}
