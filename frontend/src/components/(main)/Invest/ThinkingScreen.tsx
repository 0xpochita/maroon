"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AI_NAME, AiOrb, ThinkingDots } from "./parts";

const STEPS = [
  "Reading your goal…",
  "Scanning real DeFi vaults…",
  "Balancing yield and safety…",
  "Checking live APYs…",
  `Putting your plan together…`,
];

// Purely cosmetic: the flow advances to the plan only when the real allocation
// resolves, not on this timer.
export function ThinkingScreen() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((n) => Math.min(n + 1, STEPS.length - 1)),
      720,
    );
    return () => clearInterval(t);
  }, []);

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
        <AiOrb size={92} spin />
      </motion.span>

      <h1 className="text-2xl font-semibold leading-tight">
        {AI_NAME} is building
        <br />
        your plan
      </h1>

      <div className="flex h-6 items-center gap-2 text-sm text-muted-foreground">
        <ThinkingDots />
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
          >
            {STEPS[i]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {STEPS.map((s, n) => (
          <motion.span
            key={s}
            className="h-2 rounded-full"
            animate={{
              width: n <= i ? 22 : 8,
              backgroundColor:
                n <= i ? "var(--color-primary)" : "var(--color-border)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
