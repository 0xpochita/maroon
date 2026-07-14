"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function YieldTrend({ apy }: { apy: number }) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    m: i,
    v: Number((apy * (0.85 + (i / 11) * 0.3)).toFixed(2)),
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fillVault" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-success)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-success)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="v"
          type="natural"
          stroke="var(--color-success)"
          strokeWidth={2}
          fill="url(#fillVault)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
