import { Pencil, Share2 } from "lucide-react";
import { PnlChart } from "./PnlChart";
import { PositionsSection } from "./PositionsSection";

const STATS = [
  { label: "Positions value", value: "$1,284.52" },
  { label: "Total earned", value: "+$12.40" },
  { label: "Vaults", value: "3" },
];

const RANGES = ["1D", "1W", "1M", "1Y", "ALL"];

export function Profile() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard />
        <PnlCard />
      </div>
      <PositionsSection />
    </div>
  );
}

function ProfileCard() {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="size-16 rounded-full bg-gradient-to-br from-primary to-warning" />
          <div>
            <h1 className="text-xl font-bold">0x3f..a1</h1>
            <p className="text-sm text-muted-foreground">Joined Jul 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <IconButton label="Edit profile">
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label="Share profile">
            <Share2 className="size-4" />
          </IconButton>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 divide-x divide-border">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-4 first:pl-0">
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Deposit
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl bg-muted py-2.5 text-sm font-semibold transition-colors hover:bg-muted-strong"
        >
          Withdraw
        </button>
      </div>
    </article>
  );
}

function PnlCard() {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full bg-success" />
          Profit / Loss
        </span>
        <div className="flex items-center gap-0.5 text-xs">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              className={`rounded-md px-2 py-1 font-medium ${range === "1D" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-success">+$12.40</p>
      <p className="text-xs text-muted-foreground">Past day</p>
      <div className="mt-4 min-h-32 flex-1">
        <PnlChart />
      </div>
    </article>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
