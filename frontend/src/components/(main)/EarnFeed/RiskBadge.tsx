import type { RiskLevel } from "@/types/earn";
import { RISK_CONFIG } from "./risk";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { label, badgeClass } = RISK_CONFIG[risk];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
    >
      {label}
    </span>
  );
}
