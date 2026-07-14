import Image from "next/image";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import type { Allocation, EarnPlan } from "@/types/earn";
import { RiskBadge } from "./RiskBadge";
import { RISK_CONFIG } from "./risk";

export function PlanCard({ plan }: { plan: EarnPlan }) {
  return (
    <article className="rounded-card border border-border bg-surface p-5 transition-shadow hover:shadow-md">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`mt-1 size-2.5 shrink-0 rounded-full ${RISK_CONFIG[plan.risk].dotClass}`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{plan.name}</h3>
              <RiskBadge risk={plan.risk} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatCompactUsd(plan.tvlUsd)} TVL · {plan.asset}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-success">
            {formatPercent(plan.apy)}
          </p>
          <p className="text-xs text-muted-foreground">blended APY</p>
        </div>
      </header>
      <div className="mt-4 border-t border-border">
        {plan.allocations.map((allocation) => (
          <AllocationRow
            key={allocation.protocol.name}
            allocation={allocation}
          />
        ))}
      </div>
    </article>
  );
}

function AllocationRow({ allocation }: { allocation: Allocation }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <Image
          src={allocation.protocol.logo}
          alt={allocation.protocol.name}
          width={32}
          height={32}
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-medium">{allocation.protocol.name}</p>
          <p className="text-xs text-muted-foreground">{allocation.chain}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-success">
          {formatPercent(allocation.apy)}
        </span>
        <button
          type="button"
          className="rounded-full bg-success px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-success/90"
        >
          Earn
        </button>
      </div>
    </div>
  );
}
