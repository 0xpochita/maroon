"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { AiOrb } from "./parts";
import type { InvestFlow } from "./useInvest";

// Follows the real per-leg deposit progress from the flow (placingStep).
export function PlacingScreen({ flow }: { flow: InvestFlow }) {
  const legs = flow.plan?.legs ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center gap-6 text-center"
    >
      <motion.span
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full"
        style={{ filter: "drop-shadow(0 0 26px var(--color-primary-subtle))" }}
      >
        <AiOrb size={64} spin />
      </motion.span>

      <h1 className="text-2xl font-semibold leading-tight">
        Securing your
        <br />
        deposits
      </h1>

      <div className="w-full max-w-xs divide-y divide-border rounded-xl border border-border text-left">
        {legs.map((leg, i) => {
          const done = i < flow.placingStep;
          const active = i === flow.placingStep;
          return (
            <div
              key={leg.vault.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-40" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {leg.vault.protocol.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {leg.vault.chain}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatUsd(leg.amountUsd)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Gas-free · one tap, no chains to manage
      </p>
    </motion.div>
  );
}
