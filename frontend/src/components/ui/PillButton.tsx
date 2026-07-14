type Tone = "green" | "muted";

export function PillButton({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "bg-success text-white hover:bg-success/90"
      : "bg-muted text-muted-foreground hover:bg-muted-strong";
  return (
    <button
      type="button"
      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-colors ${toneClass}`}
    >
      {children}
    </button>
  );
}
