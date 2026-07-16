"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";

// Real recent APY (30d / 7d / 1d / now) from LI.FI snapshots.
export function YieldTrend({
  data,
}: {
  data: { label: string; apy: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
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
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Area
          dataKey="apy"
          type="natural"
          stroke="var(--color-success)"
          strokeWidth={2}
          fill="url(#fillTrend)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
