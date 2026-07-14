"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const DATA = [
  { month: "Jan", Aave: 4.8, Morpho: 7.5, "Euler Finance": 8.9 },
  { month: "Feb", Aave: 4.9, Morpho: 7.8, "Euler Finance": 9.3 },
  { month: "Mar", Aave: 5.0, Morpho: 8.0, "Euler Finance": 9.9 },
  { month: "Apr", Aave: 5.1, Morpho: 8.3, "Euler Finance": 10.4 },
  { month: "May", Aave: 5.2, Morpho: 8.5, "Euler Finance": 10.8 },
  { month: "Jun", Aave: 5.3, Morpho: 8.7, "Euler Finance": 11.1 },
  { month: "Jul", Aave: 5.4, Morpho: 8.9, "Euler Finance": 11.4 },
  { month: "Aug", Aave: 5.5, Morpho: 9.0, "Euler Finance": 11.6 },
  { month: "Sep", Aave: 5.6, Morpho: 9.1, "Euler Finance": 11.8 },
  { month: "Oct", Aave: 5.7, Morpho: 9.15, "Euler Finance": 12.0 },
  { month: "Nov", Aave: 5.8, Morpho: 9.2, "Euler Finance": 12.1 },
];

const SERIES = [
  { key: "Aave", color: "var(--color-primary)", fill: "url(#fillAave)" },
  { key: "Morpho", color: "var(--color-high)", fill: "url(#fillMorpho)" },
  {
    key: "Euler Finance",
    color: "var(--color-success)",
    fill: "url(#fillEuler)",
  },
];

export function YieldChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={DATA} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="fillAave" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-primary)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--color-primary)"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="fillMorpho" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-high)"
              stopOpacity={0.25}
            />
            <stop offset="95%" stopColor="var(--color-high)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillEuler" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-success)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--color-success)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
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
        {SERIES.map((series) => (
          <Area
            key={series.key}
            dataKey={series.key}
            type="natural"
            stroke={series.color}
            strokeWidth={2}
            fill={series.fill}
            fillOpacity={1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
