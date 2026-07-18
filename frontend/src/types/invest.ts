import type { Vault } from "./earn";

// Risk bands used across the AI-invest flow. Reuses the same three levels as
// EarnPlan (RiskLevel) so copy/colors stay consistent app-wide.
export type RiskLabel = "safe" | "balanced" | "degen";

// One vault in an AI-built plan, with its resolved share of the deposit.
export interface PlanLeg {
  vault: Vault;
  weightPct: number;
  amountUsd: number;
  reason: string;
}

// The full, resolved plan the /invest flow renders and executes. Built server
// side from the LI.FI vault universe (real data) plus either Claude or the
// deterministic mock allocator.
export interface InvestPlan {
  summary: string;
  rationale: string;
  /** Blended portfolio risk in basis points (0-10000), derived from LI.FI tags. */
  riskScore: number;
  riskLabel: RiskLabel;
  amountUsd: number;
  /** Weight-averaged APY across the legs. */
  blendedApy: number;
  legs: PlanLeg[];
  /** Where the allocation text came from ("ai" = Claude, "mock" = heuristic). */
  source: "ai" | "mock";
  /** Optional notes, e.g. vaults dropped as undepositable. */
  notes?: string[];
}
