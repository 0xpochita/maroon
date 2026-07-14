import Image from "next/image";
import { protocolFilters } from "@/lib/mock/earn";
import { StepDecor } from "./StepDecor";
import { YieldChart } from "./YieldChart";

const DEFI = "/Assets/Images/Logo/logo-defi";
const CHAIN = "/Assets/Images/Logo/logo-chain";

interface HowStep {
  title: string;
  desc: string;
}

const STEPS: HowStep[] = [
  { title: "Add money", desc: "Deposit USDC. No crypto experience needed." },
  {
    title: "Pick a plan",
    desc: "Safe, Balanced, or Degen. You choose the risk.",
  },
  { title: "Earn hands-free", desc: "Your balance grows. Withdraw anytime." },
];

interface Stat {
  label: string;
  value: string;
  logos?: string[];
}

const STATS: Stat[] = [
  {
    label: "Total TVL",
    value: "$30.9M",
    logos: [
      `${DEFI}/usdc-logo.webp`,
      `${DEFI}/aave-logo.webp`,
      `${DEFI}/morpho-logo.webp`,
      `${DEFI}/euler-logo.png`,
    ],
  },
  { label: "APY range", value: "5.8-23.7%" },
  { label: "Protocols", value: "3" },
  {
    label: "Chains",
    value: "3",
    logos: [`${CHAIN}/base-logo.jpg`, `${CHAIN}/arb-logo.svg`],
  },
];

export function FeaturedHero() {
  return (
    <article className="flex flex-col rounded-card border border-border bg-surface p-6">
      <HeroTop />
      <HowItWorks />
      <HeroStats />
    </article>
  );
}

function HeroTop() {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-center">
      <HeroCopy />
      <HeroChart />
    </div>
  );
}

function HeroCopy() {
  return (
    <div>
      <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
        Put your money to work. Up to 23.70% APY.
      </h2>
      <p className="mt-3 text-muted-foreground">
        Real DeFi yield in one tap. No wallet, gas, or chains to manage.
      </p>
      <button
        type="button"
        className="mt-6 rounded-full bg-success px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-success/90"
      >
        Start earning
      </button>
      <div className="mt-6 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Powered by</span>
        <div className="flex -space-x-2">
          {protocolFilters.map((protocol) => (
            <Image
              key={protocol.name}
              src={protocol.logo}
              alt={protocol.name}
              width={24}
              height={24}
              className="rounded-full border-2 border-surface bg-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroChart() {
  return (
    <div className="rounded-xl bg-muted/60 p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-3xl font-bold text-success">+18.4%</p>
          <p className="text-xs text-muted-foreground">avg. yield, 12 months</p>
        </div>
        <p className="text-xs text-muted-foreground">$30.9M TVL</p>
      </div>
      <div className="mt-4">
        <YieldChart />
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="mt-8 border-t border-border pt-6">
      <p className="font-semibold">How it works</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Step key={step.title} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}

function Step({ step, index }: { step: HowStep; index: number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-5">
      <StepDecor seed={index} />
      <div className="relative z-10">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
          {index + 1}
        </span>
        <p className="mt-3 font-semibold">{step.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
      </div>
    </div>
  );
}

function HeroStats() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label}>
          <p className="text-lg font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          {stat.logos ? (
            <div className="mt-2 flex -space-x-1.5">
              {stat.logos.map((logo) => (
                <Image
                  key={logo}
                  src={logo}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded-full border-2 border-surface bg-surface"
                />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
