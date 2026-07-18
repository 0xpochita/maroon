import type { Vault } from "@/types/earn";
import type { PlanLeg, RiskLabel } from "@/types/invest";

// Risk is derived from LI.FI's own category tags, so the score is grounded in
// the real vault data, not a guess. Basis points (0-10000).
export function vaultRiskBps(v: Vault): number {
  const cats = new Set(v.categories);
  const stable = cats.has("stablecoins");
  let base: number;
  if (cats.has("high-risk")) base = 7000;
  else if (stable) base = 2000;
  else if (cats.has("liquid-staking")) base = 2500;
  else if (cats.has("low-risk")) base = 3500;
  else base = 5000; // plain lending
  // APY is a strong, category-independent risk signal: a steep, high-capped
  // nudge so a 20%+ APY can never read as very safe, even if LI.FI tagged the
  // (blue-chip) protocol "low-risk". Non-stable assets also carry price risk.
  const apyNudge = Math.min(4000, Math.max(0, (v.apy - 5) * 120));
  const priceRisk = stable ? 0 : 500;
  return Math.round(Math.min(9500, Math.max(500, base + apyNudge + priceRisk)));
}

// Weight-averaged risk across the plan's legs.
export function blendRiskBps(
  legs: Pick<PlanLeg, "vault" | "weightPct">[],
): number {
  const totalW = legs.reduce((s, l) => s + l.weightPct, 0) || 1;
  const weighted = legs.reduce(
    (s, l) => s + vaultRiskBps(l.vault) * l.weightPct,
    0,
  );
  return Math.round(weighted / totalW);
}

export function riskLabel(bps: number): RiskLabel {
  if (bps < 3000) return "safe";
  if (bps < 5500) return "balanced";
  return "degen";
}

// Five-dash meter level (1-5) + a friendly word, mirroring the plan risk card.
export function riskMeta(bps: number): { level: number; word: string } {
  const pct = bps / 100; // 0-100
  if (pct < 20) return { level: 1, word: "Very steady" };
  if (pct < 40) return { level: 2, word: "Cautious" };
  if (pct < 60) return { level: 3, word: "Balanced" };
  if (pct < 80) return { level: 4, word: "Adventurous" };
  return { level: 5, word: "Bold" };
}

// Segment colors for the stacked allocation bar (theme tokens, red-free palette).
export const LEG_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-high)",
  "var(--color-warning)",
  "#0ea5e9",
  "#ec4899",
];
