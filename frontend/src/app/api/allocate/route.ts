import { type NextRequest, NextResponse } from "next/server";
import { AllocateRequestSchema } from "@/lib/allocation-schema";
import { buildInvestPlan } from "@/lib/server/allocate";

// Builds an AI yield plan from a plain-language goal. Runs server-side so the
// LI.FI key (vault universe) and the Anthropic key (Claude) stay off the client.
// Without ANTHROPIC_API_KEY it falls back to a deterministic allocator over the
// same real LI.FI vaults, so the flow works keyless like the rest of Maroon.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const parsed = AllocateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      { status: 400 },
    );
  }

  try {
    const { goal, amountUsd, risk } = parsed.data;
    const plan = await buildInvestPlan(goal, amountUsd, risk);
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? "allocate failed" },
      { status: 500 },
    );
  }
}
