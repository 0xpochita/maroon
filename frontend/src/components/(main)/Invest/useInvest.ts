"use client";

import { useCallback, useRef, useState } from "react";
import { useAccountStore } from "@/stores/account";
import type { InvestPlan, RiskLabel } from "@/types/invest";

// The AI-invest flow state machine, mirroring Stax's Lite invest loop:
//   goal -> thinking -> plan -> placing -> success
// A nudge on the plan re-runs allocation with a risk hint appended to the goal.
export type InvestPhase = "goal" | "thinking" | "plan" | "placing" | "success";

export type Tone = "balanced" | "safer" | "bolder" | "simple";

const TONE_RISK: Record<Tone, RiskLabel> = {
  balanced: "balanced",
  safer: "safe",
  bolder: "degen",
  simple: "safe",
};

// Appended to the goal so a nudge literally re-prompts with the risk phrase.
const TONE_HINT: Record<Tone, string> = {
  balanced: "",
  safer: " (lean safer, protect my money first)",
  bolder: " (be bolder, I can handle bigger swings for more yield)",
  simple: " (keep it simple, just a couple of easy vaults)",
};

async function allocate(
  goal: string,
  amountUsd: number,
  risk: RiskLabel,
  hint = "",
): Promise<InvestPlan> {
  const res = await fetch("/api/allocate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ goal: goal + hint, amountUsd, risk }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "The copilot couldn't build a plan.");
  }
  const data = await res.json();
  return data.plan as InvestPlan;
}

export function useInvest() {
  const depositPlan = useAccountStore((s) => s.depositPlan);

  const [phase, setPhase] = useState<InvestPhase>("goal");
  const [goal, setGoal] = useState("");
  const [amountUsd, setAmountUsd] = useState(300);
  const [plan, setPlan] = useState<InvestPlan | null>(null);
  const [tone, setTone] = useState<Tone>("balanced");
  const [rethinking, setRethinking] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [txIds, setTxIds] = useState<string[]>([]);
  const [placingStep, setPlacingStep] = useState(0);
  const placingRef = useRef(false);

  const ready = goal.trim().length > 3 && amountUsd > 0;

  // goal -> thinking -> plan
  const start = useCallback(async () => {
    const g = goal.trim();
    if (g.length < 4 || amountUsd <= 0) return;
    setError(undefined);
    setTone("balanced");
    setPhase("thinking");
    try {
      const p = await allocate(g, amountUsd, "balanced");
      setPlan(p);
      setPhase("plan");
    } catch (e) {
      setError((e as Error).message);
      setPhase("goal");
    }
  }, [goal, amountUsd]);

  // Nudge chips: re-allocate with a risk hint, blurring the current plan.
  const nudge = useCallback(
    async (t: Tone) => {
      if (rethinking) return;
      setTone(t);
      setRethinking(true);
      setError(undefined);
      try {
        const p = await allocate(
          goal.trim(),
          amountUsd,
          TONE_RISK[t],
          TONE_HINT[t],
        );
        setPlan(p);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setRethinking(false);
      }
    },
    [goal, amountUsd, rethinking],
  );

  // plan -> placing -> success. Deposits one vault per leg (sequentially). A
  // cosmetic stepper advances while the real deposits run, then snaps complete.
  const place = useCallback(async () => {
    if (!plan || placingRef.current) return;
    placingRef.current = true;
    const total = plan.legs.length;
    setError(undefined);
    setPlacingStep(0);
    setPhase("placing");

    let step = 0;
    const timer = setInterval(() => {
      step = Math.min(step + 1, total - 1);
      setPlacingStep(step);
    }, 900);

    try {
      const res = await depositPlan(
        plan.legs.map((l) => ({ vault: l.vault, amountUsd: l.amountUsd })),
      );
      clearInterval(timer);
      if (res.ok) {
        setTxIds(res.ids);
        setPlacingStep(total);
        setPhase("success");
      } else {
        setError(res.error ?? "Some deposits didn't go through.");
        setPhase("plan");
      }
    } catch (e) {
      clearInterval(timer);
      setError((e as Error)?.message ?? "The deposit didn't go through.");
      setPhase("plan");
    } finally {
      placingRef.current = false;
    }
  }, [plan, depositPlan]);

  const back = useCallback(() => {
    setPhase("goal");
    setError(undefined);
  }, []);

  const reset = useCallback(() => {
    setPhase("goal");
    setPlan(null);
    setTone("balanced");
    setError(undefined);
    setTxIds([]);
    setPlacingStep(0);
  }, []);

  const clearError = useCallback(() => setError(undefined), []);

  const busy = phase === "thinking" || phase === "placing" || rethinking;

  return {
    phase,
    goal,
    amountUsd,
    plan,
    tone,
    rethinking,
    error,
    txIds,
    placingStep,
    placingTotal: plan?.legs.length ?? 0,
    ready,
    busy,
    setGoal,
    setAmountUsd,
    start,
    nudge,
    place,
    back,
    reset,
    clearError,
  };
}

export type InvestFlow = ReturnType<typeof useInvest>;
