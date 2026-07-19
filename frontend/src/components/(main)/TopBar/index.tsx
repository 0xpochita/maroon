"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatUsd } from "@/lib/format";
import { useAccountStore } from "@/stores/account";
import { useUiStore } from "@/stores/ui";
import { NotificationMenu } from "../NotificationMenu";
import { ProfileMenu } from "../ProfileMenu";
import { SavedMenu } from "../SavedMenu";
import { WalletMenu } from "../WalletMenu";

export function TopBar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6">
        <Brand />
        <SearchField />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <InvestWithAI />
          <TopBarActions />
        </div>
      </div>
    </header>
  );
}

function InvestWithAI() {
  const pathname = usePathname();
  const active = pathname === "/invest";
  return (
    <Link
      href="/invest"
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
    >
      <Image
        src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
        alt=""
        width={16}
        height={16}
        className="size-4 object-contain"
      />
      <span className="hidden sm:inline">Invest with AI</span>
    </Link>
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
    <div className="hidden w-full max-w-xl items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5 sm:flex">
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
  const status = useAccountStore((s) => s.status);
  const balanceUsd = useAccountStore((s) => s.balanceUsd);
  const openDeposit = useUiStore((s) => s.openDeposit);

  if (status !== "ready") {
    return <AuthButtons />;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Stat label="Balance" value={formatUsd(balanceUsd ?? 0)} />
      <button
        type="button"
        onClick={openDeposit}
        className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)]"
      >
        Deposit
      </button>
      <div className="hidden items-center gap-2 sm:flex sm:gap-3">
        <SavedMenu />
        <WalletMenu />
      </div>
      <NotificationMenu />
      <ProfileMenu />
    </div>
  );
}

function AuthButtons() {
  const status = useAccountStore((s) => s.status);
  const openAuth = useUiStore((s) => s.openAuth);
  const busy = status === "connecting";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openAuth("login")}
        disabled={busy}
        className="rounded-xl px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        Log In
      </button>
      <button
        type="button"
        onClick={() => openAuth("signup")}
        disabled={busy}
        className="rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)] disabled:opacity-50"
      >
        {busy ? "..." : "Sign Up"}
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
