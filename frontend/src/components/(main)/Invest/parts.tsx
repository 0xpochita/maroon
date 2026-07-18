"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LEG_COLORS } from "@/lib/risk";
import type { PlanLeg } from "@/types/invest";

// The AI copilot's persona name. Change here to rebrand the whole flow.
export const AI_NAME = "MARAI";

// Gradient orb standing in for the copilot (Maroon ships no avatar image).
export function AiOrb({
  size = 32,
  spin = false,
}: {
  size?: number;
  spin?: boolean;
}) {
  return (
    <motion.span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(120% 120% at 30% 25%, var(--color-primary) 0%, var(--color-high) 100%)",
      }}
      animate={spin ? { rotate: 360 } : undefined}
      transition={
        spin ? { duration: 8, ease: "linear", repeat: Infinity } : undefined
      }
    >
      <Sparkles
        className="text-primary-foreground"
        style={{ width: size * 0.5, height: size * 0.5 }}
      />
    </motion.span>
  );
}

// Verified-style tag next to the copilot name.
export function AiTag() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1">
      <AiOrb size={18} spin />
      <span className="text-sm font-semibold">{AI_NAME}</span>
    </span>
  );
}

// Three dots pulsing in sequence, for the "thinking / rethinking" moments.
export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.16,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

// Five-dash risk meter; the first `level` dashes fill with the primary color.
export function RiskMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 rounded-full"
          initial={{ width: 8 }}
          animate={{
            width: i <= level ? 22 : 8,
            backgroundColor:
              i <= level ? "var(--color-primary)" : "var(--color-border)",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 24,
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  );
}

// Single stacked bar: one segment per leg, width = weight%.
export function AllocationBar({ legs }: { legs: PlanLeg[] }) {
  return (
    <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full">
      {legs.map((leg, i) => (
        <motion.span
          key={leg.vault.id}
          title={leg.vault.protocol.name}
          className="h-full rounded-full first:rounded-l-full last:rounded-r-full"
          style={{ background: LEG_COLORS[i % LEG_COLORS.length] }}
          initial={{ width: 0 }}
          animate={{ width: `${leg.weightPct}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
