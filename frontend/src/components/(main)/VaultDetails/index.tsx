import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { getVaultById } from "@/lib/lifi";
import { EarnButton } from "../EarnButton";
import { VaultAvatar } from "../VaultAvatar";
import { YieldTrend } from "./YieldTrend";

export async function VaultDetails({ id }: { id: string }) {
  const vault = await getVaultById(id);
  if (!vault) notFound();

  const facts = [
    ...(vault.name ? [{ label: "Vault", value: vault.name }] : []),
    { label: "Underlying asset", value: vault.asset },
    { label: "Protocol", value: vault.protocol.name },
    { label: "Network", value: vault.chain },
    { label: "Yield (APY)", value: formatPercent(vault.apy) },
    { label: "Withdraw", value: "Anytime, no lock" },
  ];

  const steps = [
    {
      title: "Add funds",
      desc: "Deposit USDC from any chain, or buy with cash. One tap.",
    },
    {
      title: "Earn automatically",
      desc: `Your balance grows about ${formatPercent(vault.apy)} a year. No staking or claiming.`,
    },
    {
      title: "Withdraw anytime",
      desc: "No lock-up. Take your money out whenever you want.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-0">
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
              {vault.name ? (
                <p className="text-sm text-muted-foreground">{vault.name}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
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

          <div>
            <h2 className="text-sm font-semibold">How it works</h2>
            <div className="mt-3 flex flex-col gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-muted/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Yield over time</h2>
            <div className="mt-3 h-56">
              <YieldTrend data={vault.apyHistory ?? []} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">About this vault</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your {vault.asset} is put to work in {vault.protocol.name} on{" "}
              {vault.chain} to earn about {formatPercent(vault.apy)} a year. You
              keep full control and can withdraw anytime. Maroon handles the
              wallet, gas and network switching for you.
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
              {vault.sourceUrl || vault.protocol.url ? (
                <div className="flex justify-between py-2.5 text-sm">
                  <dt className="text-muted-foreground">Source</dt>
                  <a
                    href={vault.sourceUrl || vault.protocol.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-medium text-primary transition-colors hover:underline"
                  >
                    Open on {vault.protocol.name}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ) : null}
            </dl>
            <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Yields change with the market and are not guaranteed. Only deposit
              what you can afford to leave earning.
            </p>
          </section>
        </div>

        <aside className="hidden lg:block">
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

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div>
          <p className="text-xs text-muted-foreground">Estimated yield</p>
          <p className="text-lg font-bold text-success">
            {formatPercent(vault.apy)}
            <span className="text-xs font-medium text-muted-foreground">
              {" "}
              / year
            </span>
          </p>
        </div>
        <EarnButton
          vault={vault}
          className="shrink-0 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)]"
        >
          Earn now
        </EarnButton>
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
