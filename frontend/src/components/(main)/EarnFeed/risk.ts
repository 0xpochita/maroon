import type { RiskLevel } from "@/types/earn";

interface RiskStyle {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const RISK_CONFIG: Record<RiskLevel, RiskStyle> = {
  safe: {
    label: "Low risk",
    badgeClass: "bg-success-subtle text-success",
    dotClass: "bg-success",
  },
  balanced: {
    label: "Medium risk",
    badgeClass: "bg-warning-subtle text-warning",
    dotClass: "bg-warning",
  },
  degen: {
    label: "High risk",
    badgeClass: "bg-high-subtle text-high",
    dotClass: "bg-high",
  },
};
