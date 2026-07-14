"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

const DATA = [
  { i: 0, value: 0 },
  { i: 1, value: 1.8 },
  { i: 2, value: 1.2 },
  { i: 3, value: 3.6 },
  { i: 4, value: 5.1 },
  { i: 5, value: 4.4 },
  { i: 6, value: 7.8 },
  { i: 7, value: 9.5 },
  { i: 8, value: 12.4 },
];

export function PnlChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={DATA} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="value"
          type="natural"
          stroke="var(--color-success)"
          strokeWidth={2}
          fill="url(#fillPnl)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
