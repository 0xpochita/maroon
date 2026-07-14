import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { getVault } from "@/lib/mock/earn";
import { EarnButton } from "../EarnButton";
import { VaultAvatar } from "../VaultAvatar";
import { YieldTrend } from "./YieldTrend";

export function VaultDetails({ id }: { id: string }) {
  const vault = getVault(id);
  if (!vault) notFound();

  const facts = [
    { label: "Protocol", value: vault.protocol.name },
    { label: "Network", value: vault.chain },
    { label: "Asset", value: vault.asset },
    { label: "Yield (APY)", value: formatPercent(vault.apy) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/defi"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All vaults
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <VaultAvatar vault={vault} size={56} />
            <div>
              <h1 className="text-2xl font-semibold">{vault.protocol.name}</h1>
              <p className="text-sm text-muted-foreground">
                {vault.asset} · {vault.chain}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Yield per year"
              value={formatPercent(vault.apy)}
              accent
            />
            <Stat
              label="Total deposited"
              value={formatCompactUsd(vault.tvlUsd)}
            />
          </div>
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Yield over time</h2>
            <div className="mt-3 h-56">
              <YieldTrend apy={vault.apy} />
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">About this vault</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your {vault.asset} is deposited into {vault.protocol.name} on{" "}
              {vault.chain} to earn {formatPercent(vault.apy)} a year. Withdraw
              anytime. Maroon handles wallets, gas and chains for you.
            </p>
            <dl className="mt-4 divide-y divide-border">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex justify-between py-2.5 text-sm"
                >
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <aside>
          <div className="sticky top-6 rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">Estimated yield</p>
            <p className="flex items-baseline gap-1 text-3xl font-bold text-success">
              {formatPercent(vault.apy)}
              <span className="text-sm font-medium text-muted-foreground">
                / year
              </span>
            </p>
            <EarnButton
              vault={vault}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Earn now
            </EarnButton>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              One tap. No gas, no chains to manage.
            </p>
          </div>
        </aside>
      </div>
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
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
  );
}
