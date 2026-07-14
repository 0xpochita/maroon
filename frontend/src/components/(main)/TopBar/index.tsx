import { Bell, ChevronDown, Gift, Search } from "lucide-react";
import Image from "next/image";
import { formatUsd } from "@/lib/format";
import { portfolio } from "@/lib/mock/earn";

export function TopBar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-6 py-3">
        <Brand />
        <SearchField />
        <TopBarActions />
      </div>
    </header>
  );
}

function Brand() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Image
        src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
        alt="Maroon"
        width={36}
        height={32}
        priority
      />
      <span className="text-lg font-semibold tracking-tight">Maroon</span>
    </div>
  );
}

function SearchField() {
  return (
    <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5">
      <Search className="size-4 text-muted-foreground" />
      <input
        type="search"
        aria-label="Search"
        placeholder="Search plans, vaults, protocols..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function TopBarActions() {
  return (
    <div className="ml-auto flex items-center gap-4">
      <Stat label="Portfolio" value={formatUsd(portfolio.totalUsd)} />
      <Stat label="Earning" value={formatUsd(portfolio.earningUsd)} accent />
      <button
        type="button"
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Deposit
      </button>
      <IconButton label="Rewards">
        <Gift className="size-5" />
      </IconButton>
      <IconButton label="Notifications">
        <Bell className="size-5" />
      </IconButton>
      <button
        type="button"
        aria-label="Account"
        className="flex items-center gap-1"
      >
        <span className="size-9 rounded-full bg-gradient-to-br from-primary to-warning" />
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="hidden text-right sm:block">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${accent ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
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
      className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}
