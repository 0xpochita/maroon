import "server-only";

// buildInvestPlan - Maroon's core allocation logic. Turns a plain-language goal
// + amount into a validated, resolved basket of REAL LI.FI yield vaults.
//
// Universe: always real LI.FI data (fetchVaults), filtered to vaults that are
// actually depositable via the Universal Account (UA chains + a vault address).
// Brain: Claude when ANTHROPIC_API_KEY is set; otherwise a deterministic
// heuristic fallback so the flow runs keyless, matching Maroon's mock-mode.
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, type LanguageModel } from "ai";
import { AllocationSchema, type RawAllocation } from "@/lib/allocation-schema";
import { fetchVaults } from "@/lib/lifi";
import { blendRiskBps, riskLabel } from "@/lib/risk";
import { isUaChain } from "@/lib/ua-chains";
import type { Vault } from "@/types/earn";
import type { InvestPlan, PlanLeg, RiskLabel } from "@/types/invest";

const MAX_UNIVERSE = 40; // cap the prompt size / keep quality high
const MAX_LEGS = 5;

// Model selection: OpenRouter if OPENROUTER_API_KEY is set (one key, many
// models), else native Anthropic if ANTHROPIC_API_KEY is set, else null (caller
// uses the deterministic heuristic). Both run generateObject identically.
function getModel(): LanguageModel | null {
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      apiKey: orKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
    return openrouter(
      process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5",
    );
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(process.env.AI_MODEL || "claude-sonnet-5");
  }
  return null;
}

// Vaults we can actually deposit into in one tap.
function depositable(all: Vault[]): Vault[] {
  return all
    .filter((v) => v.vaultAddress && v.chainId && isUaChain(v.chainId))
    .sort((a, b) => b.tvlUsd - a.tvlUsd)
    .slice(0, MAX_UNIVERSE);
}

// Short, stable handles keep the model from hallucinating long addresses.
function handleMap(universe: Vault[]) {
  const byHandle = new Map<string, Vault>();
  universe.forEach((v, i) => {
    byHandle.set(`a${i}`, v);
  });
  return byHandle;
}

function universeLines(byHandle: Map<string, Vault>): string {
  return [...byHandle.entries()]
    .map(
      ([h, v]) =>
        `${h} | ${v.name ?? v.protocol.name} | ${v.protocol.name} | ${v.chain} | ${v.asset} | ${v.apy.toFixed(2)}% APY | ${v.categories.join(",")}`,
    )
    .join("\n");
}

function systemPrompt(lines: string): string {
  return [
    "You are Maroon, an AI yield copilot. You turn a person's plain-language goal",
    "into a diversified basket of REAL DeFi yield vaults they deposit into in one tap.",
    "",
    "RULES:",
    "- Allocate ONLY across the vaults listed below, by their handle (e.g. a0, a3).",
    `- Use ${MAX_LEGS} vaults at most. Weights are percentages that MUST sum to 100.`,
    "- Diversify sensibly for the user's risk: spread across a few protocols/chains.",
    "  Don't put everything in one vault unless the user explicitly insists.",
    "- Match risk to the goal. Safe: stablecoin + blue-chip low-risk vaults (Aave,",
    "  Morpho, Lido). Aggressive / high yield: higher-APY best-yield vaults.",
    "- Prefer higher APY within the risk band the user asked for.",
    "- Explain like the user has never used DeFi. Warm, concrete, zero jargon.",
    "- Writing style for all text: short plain sentences. NEVER use em dashes; use",
    "  commas or periods. No buzzwords. Don't restate the goal; get to the substance.",
    "",
    "AVAILABLE VAULTS (handle | name | protocol | chain | asset | APY | tags):",
    lines,
  ].join("\n");
}

// Turn raw {handle/id, weight, reason} picks into a resolved, normalized plan.
function buildPlan(
  picks: RawAllocation["allocations"],
  resolve: (id: string) => Vault | undefined,
  amountUsd: number,
  summary: string,
  rationale: string,
  source: "ai" | "mock",
  notes?: string[],
): InvestPlan | null {
  const seen = new Set<string>();
  const valid = picks
    .map((p) => ({ p, v: resolve(p.vaultId) }))
    .filter((x): x is { p: RawAllocation["allocations"][number]; v: Vault } => {
      if (!x.v || x.p.weightPct <= 0) return false;
      if (seen.has(x.v.id)) return false;
      seen.add(x.v.id);
      return true;
    })
    .slice(0, MAX_LEGS);
  if (!valid.length) return null;

  const totalW = valid.reduce((s, x) => s + x.p.weightPct, 0) || 1;
  const legs: PlanLeg[] = valid.map((x) => {
    const weightPct = Math.round((x.p.weightPct / totalW) * 10000) / 100;
    return {
      vault: x.v,
      weightPct,
      amountUsd: Math.round(amountUsd * weightPct) / 100,
      reason: x.p.reason,
    };
  });

  const riskScore = blendRiskBps(legs);
  const blendedApy =
    legs.reduce((s, l) => s + l.vault.apy * l.weightPct, 0) / 100;

  return {
    summary,
    rationale,
    riskScore,
    riskLabel: riskLabel(riskScore),
    amountUsd,
    blendedApy,
    legs,
    source,
    notes,
  };
}

// ---------- AI path ----------

const JSON_INSTRUCTION =
  'Respond with ONLY a JSON object, no markdown fences, no prose. Shape: {"summary": string, "rationale": string, "allocations": [{"vaultId": string, "weightPct": number, "reason": string}]}. Weights must sum to 100.';

// Pull the JSON object out of the model's reply (handles ```json fences / stray prose).
function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start === -1 || end < start ? null : body.slice(start, end + 1);
}

function parseAllocation(text: string): RawAllocation | null {
  const json = extractJson(text);
  if (!json) return null;
  try {
    const result = AllocationSchema.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

async function aiPlan(
  model: LanguageModel,
  goal: string,
  amountUsd: number,
  risk: RiskLabel | undefined,
  byHandle: Map<string, Vault>,
): Promise<InvestPlan | null> {
  // generateText + manual parse (not generateObject): works across OpenRouter
  // models and native Anthropic without depending on provider structured-output
  // support. maxOutputTokens is bounded so a low-limit key can afford the call.
  const { text } = await generateText({
    model,
    maxOutputTokens: 2000,
    system: `${systemPrompt(universeLines(byHandle))}\n\n${JSON_INSTRUCTION}`,
    prompt: [
      `Goal: ${goal}`,
      `Amount to deposit: $${amountUsd}`,
      `Risk preference: ${risk ?? "infer from the goal"}`,
      "Build the allocation now.",
    ].join("\n"),
  });
  const object = parseAllocation(text);
  if (!object) return null;
  return buildPlan(
    object.allocations,
    (id) => byHandle.get(id),
    amountUsd,
    object.summary,
    object.rationale,
    "ai",
  );
}

// ---------- Mock path (deterministic heuristic over the same real vaults) ----------

function inferRisk(goal: string): RiskLabel {
  const g = goal.toLowerCase();
  if (
    /safe|aman|secure|stable|low.?risk|conservativ|preserve|protect|jaga/.test(
      g,
    )
  )
    return "safe";
  if (
    /aggress|degen|high.?yield|highest|max|risky|agresif|bold|besar|tinggi/.test(
      g,
    )
  )
    return "degen";
  return "balanced";
}

// "Safe" means a stablecoin or a liquid-staking asset, NOT the LI.FI "low-risk"
// tag (blue-chip protocols get it even on extreme-APY vaults). Safe/balanced
// also cap APY so a 90%+ WETH vault never lands in a "safe" basket.
const APY_CEIL_SAFE = 15;
const APY_CEIL_BALANCED = 25;
const isStable = (v: Vault) => v.categories.includes("stablecoins");
const isSafeAsset = (v: Vault) =>
  isStable(v) || v.categories.includes("liquid-staking");
const isHigh = (v: Vault) =>
  v.categories.includes("high-risk") || v.categories.includes("best-yield");

// Pick up to `n` vaults, avoiding piling up the same protocol on the same chain.
function pickVaried(ranked: Vault[], n: number): Vault[] {
  const out: Vault[] = [];
  const used = new Set<string>();
  for (const v of ranked) {
    const key = `${v.chainId}:${v.protocol.name}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push(v);
    if (out.length >= n) break;
  }
  // Backfill if variety left us short.
  if (out.length < n) {
    for (const v of ranked) {
      if (out.includes(v)) continue;
      out.push(v);
      if (out.length >= n) break;
    }
  }
  return out;
}

// Gentle descending weights that sum to 100.
function weightsFor(n: number): number[] {
  const presets: Record<number, number[]> = {
    1: [100],
    2: [60, 40],
    3: [45, 35, 20],
    4: [40, 30, 20, 10],
    5: [35, 25, 20, 12, 8],
  };
  return presets[n] ?? Array(n).fill(Math.round(100 / n));
}

function mockReason(v: Vault, band: RiskLabel): string {
  const yieldStr = `${v.apy.toFixed(1)}% on ${v.asset}`;
  if (band === "safe")
    return `${v.protocol.name} on ${v.chain} pays ${yieldStr}. A steady, well-known spot.`;
  if (band === "degen")
    return `${v.protocol.name} on ${v.chain} pays ${yieldStr}. Higher yield for more upside.`;
  return `${v.protocol.name} on ${v.chain} pays ${yieldStr}. A solid middle-ground vault.`;
}

function mockSummary(band: RiskLabel): string {
  if (band === "safe")
    return "A steady basket focused on keeping your money safe while it earns.";
  if (band === "degen")
    return "A higher-yield basket that reaches for more return.";
  return "A balanced basket that mixes safety and yield.";
}

function mockRationale(band: RiskLabel, picks: Vault[]): string {
  const chains = [...new Set(picks.map((v) => v.chain))].join(", ");
  const lead =
    band === "safe"
      ? "Most of the money sits in stablecoin and blue-chip vaults, so a rough week stings less."
      : band === "degen"
        ? "This leans into the highest-yielding vaults we can deposit into, so expect bigger swings."
        : "This spreads across safer and higher-yield vaults so you earn more without betting it all.";
  return `${lead} Your deposit is split across ${picks.length} vaults on ${chains}. You can nudge it safer or bolder anytime.`;
}

function mockPlan(
  goal: string,
  amountUsd: number,
  risk: RiskLabel | undefined,
  universe: Vault[],
): InvestPlan | null {
  const band = risk ?? inferRisk(goal);
  let ranked: Vault[];
  if (band === "safe") {
    ranked = universe
      .filter((v) => isSafeAsset(v) && v.apy <= APY_CEIL_SAFE)
      .sort((a, b) => b.apy - a.apy);
    if (ranked.length < 2) {
      ranked = universe.filter(isStable).sort((a, b) => b.apy - a.apy);
    }
  } else if (band === "degen") {
    ranked = universe.filter(isHigh).sort((a, b) => b.apy - a.apy);
  } else {
    const low = universe
      .filter((v) => isSafeAsset(v) && v.apy <= APY_CEIL_BALANCED)
      .sort((a, b) => b.apy - a.apy);
    const high = universe.filter(isHigh).sort((a, b) => b.apy - a.apy);
    // Interleave safer + higher-yield for a genuine mix.
    ranked = [];
    for (let i = 0; i < Math.max(low.length, high.length); i++) {
      if (low[i]) ranked.push(low[i]);
      if (high[i]) ranked.push(high[i]);
    }
  }
  if (ranked.length < 2)
    ranked = [...universe].sort((a, b) => b.tvlUsd - a.tvlUsd);

  const picks = pickVaried(ranked, Math.min(4, ranked.length));
  const weights = weightsFor(picks.length);
  const raw: RawAllocation["allocations"] = picks.map((v, i) => ({
    vaultId: v.id,
    weightPct: weights[i],
    reason: mockReason(v, band),
  }));
  const byId = new Map(universe.map((v) => [v.id, v]));
  return buildPlan(
    raw,
    (id) => byId.get(id),
    amountUsd,
    mockSummary(band),
    mockRationale(band, picks),
    "mock",
  );
}

// ---------- Public entry ----------

export async function buildInvestPlan(
  goal: string,
  amountUsd: number,
  risk?: RiskLabel,
): Promise<InvestPlan> {
  const universe = depositable(await fetchVaults());
  if (!universe.length) {
    throw new Error("No depositable vaults are available right now.");
  }

  const model = getModel();
  if (model) {
    try {
      const byHandle = handleMap(universe);
      const plan = await aiPlan(model, goal, amountUsd, risk, byHandle);
      if (plan) return plan;
    } catch (error) {
      // Fall through to the deterministic allocator so the flow never dead-ends.
      console.error("AI allocate failed, falling back to mock", error);
    }
  }

  const plan = mockPlan(goal, amountUsd, risk, universe);
  if (!plan)
    throw new Error("Could not build an allocation. Try rephrasing the goal.");
  return plan;
}
