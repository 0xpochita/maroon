import { earnPlans } from "@/lib/mock/earn";
import { PlanCard } from "./PlanCard";

export function EarnFeed() {
  return (
    <section>
      <h2 className="text-xl font-semibold">Earn plans</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {earnPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
