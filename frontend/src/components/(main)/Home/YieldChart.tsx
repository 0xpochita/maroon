export function YieldChart() {
  return (
    <svg
      viewBox="0 0 300 120"
      className="h-32 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Yield trend over the last 12 months"
    >
      <defs>
        <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-success)"
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            stopColor="var(--color-success)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path
        d="M0,104 C40,98 60,84 90,80 C120,76 140,60 170,54 C200,48 220,34 250,27 C270,22 290,16 300,13 L300,120 L0,120 Z"
        fill="url(#yieldFill)"
      />
      <path
        d="M0,104 C40,98 60,84 90,80 C120,76 140,60 170,54 C200,48 220,34 250,27 C270,22 290,16 300,13"
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
