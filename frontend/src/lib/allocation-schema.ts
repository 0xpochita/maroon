import { z } from "zod";

// The typed allocation the AI must produce from a plain-language goal. Used with
// the AI SDK's `generateObject` so the model is forced to return this shape.
// `vaultId` references a handle from the vault universe we send in the prompt.
export const AllocationSchema = z.object({
  summary: z
    .string()
    .describe("One short, friendly headline for the strategy (no jargon)."),
  rationale: z
    .string()
    .describe(
      "2-4 plain-language sentences explaining the plan to someone new to DeFi.",
    ),
  allocations: z
    .array(
      z.object({
        vaultId: z
          .string()
          .describe(
            "Vault handle - MUST be one of the handles provided (e.g. a0).",
          ),
        weightPct: z
          .number()
          .min(0)
          .max(100)
          .describe("Percent of the total deposit in this vault."),
        reason: z
          .string()
          .describe("One short, jargon-free reason this vault fits the goal."),
      }),
    )
    .min(1)
    .describe("The basket. Weights MUST sum to exactly 100."),
});

export type RawAllocation = z.infer<typeof AllocationSchema>;

// Request body for POST /api/allocate.
export const AllocateRequestSchema = z.object({
  // Bounded length caps token spend and shrinks the prompt-injection surface.
  goal: z
    .string()
    .min(1, "Tell the copilot what you want.")
    .max(600, "Keep your goal under 600 characters."),
  amountUsd: z.number().positive().max(1_000_000, "That amount is too large."),
  risk: z.enum(["safe", "balanced", "degen"]).optional(),
});

export type AllocateRequest = z.infer<typeof AllocateRequestSchema>;
