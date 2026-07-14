import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import { portfolio } from "@/lib/mock/earn";
import { NotificationMenu } from "../NotificationMenu";
import { ProfileMenu } from "../ProfileMenu";
import { WalletMenu } from "../WalletMenu";

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
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <Image
        src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
        alt="Maroon"
        width={36}
        height={32}
        priority
      />
      <span className="text-lg font-semibold tracking-tight">Maroon</span>
    </Link>
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
    <div className="ml-auto flex items-center gap-3">
      <Stat label="Portfolio" value={formatUsd(portfolio.totalUsd)} />
      <Stat label="Earning" value={formatUsd(portfolio.earningUsd)} accent />
      <button
        type="button"
        className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)]"
      >
        Deposit
      </button>
      <WalletMenu />
      <NotificationMenu />
      <ProfileMenu />
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
