export const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// Deterministic compact currency. Avoids Intl compact notation which renders
// differently on server vs client (e.g. "$25B" vs "$25.0B") and breaks
// hydration.
export const formatCompactUsd = (value: number): string => {
  const abs = Math.abs(value);
  const short = (n: number, suffix: string) =>
    `$${n.toFixed(1).replace(/\.0$/, "")}${suffix}`;
  if (abs >= 1e9) return short(value / 1e9, "B");
  if (abs >= 1e6) return short(value / 1e6, "M");
  if (abs >= 1e3) return short(value / 1e3, "K");
  return `$${value.toFixed(0)}`;
};

export const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

export const formatCents = (value: number): string => `${value.toFixed(2)}¢`;
