"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { Vault } from "@/types/earn";

const COLORS = [
  "var(--color-primary)",
  "var(--color-high)",
  "var(--color-success)",
];

// Real recent APY trend from LI.FI snapshots (30d / 7d / 1d / now). LI.FI has no
// full historical time series, so this is the real data it exposes.
export function YieldChart({ featured }: { featured: Vault[] }) {
  const labels = featured[0]?.apyHistory?.map((p) => p.label) ?? [
    "30d",
    "7d",
    "1d",
    "Now",
  ];
  const data = labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    featured.forEach((vault, idx) => {
      row[`v${idx}`] = vault.apyHistory?.[i]?.apy ?? vault.apy;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          {COLORS.map((color, i) => (
            <linearGradient
              key={color}
              id={`yfill${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border)" }}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid var(--color-border)",
            fontSize: "0.75rem",
          }}
        />
        {featured.map((vault, idx) => (
          <Area
            key={vault.id}
            dataKey={`v${idx}`}
            name={vault.protocol.name}
            type="natural"
            stroke={COLORS[idx]}
            strokeWidth={2}
            fill={`url(#yfill${idx})`}
            fillOpacity={1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
