"use client";

import { useAccountStore } from "@/stores/account";
import { useUiStore } from "@/stores/ui";
import { GoalScreen } from "./GoalScreen";
import { PlacingScreen } from "./PlacingScreen";
import { PlanScreen } from "./PlanScreen";
import { SuccessScreen } from "./SuccessScreen";
import { ThinkingScreen } from "./ThinkingScreen";
import { useInvest } from "./useInvest";

// The AI-invest flow: goal -> thinking -> plan -> placing -> success. One route
// (/invest) renders the screen for the current phase. Depositing is gated behind
// login (mock mode always allowed, like the rest of Maroon).
export function InvestFlowView() {
  const flow = useInvest();
  const status = useAccountStore((s) => s.status);
  const mock = useAccountStore((s) => s.mock);
  const openAuth = useUiStore((s) => s.openAuth);

  const guardedPlace = (): Promise<void> => {
    if (status !== "ready" && !mock) {
      openAuth("login");
      return Promise.resolve();
    }
    return flow.place();
  };

  return (
    <>
      {flow.phase === "goal" && <GoalScreen flow={flow} />}
      {flow.phase === "thinking" && <ThinkingScreen />}
      {flow.phase === "plan" && (
        <PlanScreen flow={{ ...flow, place: guardedPlace }} />
      )}
      {flow.phase === "placing" && <PlacingScreen flow={flow} />}
      {flow.phase === "success" && <SuccessScreen flow={flow} />}
    </>
  );
}
