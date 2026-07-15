export type RiskLevel = "safe" | "balanced" | "degen";

export interface Protocol {
  name: string;
  logo: string;
  url?: string;
}

export interface Allocation {
  protocol: Protocol;
  chain: string;
  apy: number;
}

export interface EarnPlan {
  id: string;
  name: string;
  tagline: string;
  apy: number;
  risk: RiskLevel;
  tvlUsd: number;
  asset: string;
  assetLogo: string;
  allocations: Allocation[];
}

export interface Vault {
  id: string;
  name?: string;
  asset: string;
  assetLogo: string;
  protocol: Protocol;
  chain: string;
  apy: number;
  tvlUsd: number;
  categories: string[];
  // Present for real LI.FI vaults; used to build a Composer deposit quote.
  chainId?: number;
  vaultAddress?: string;
  tokenAddress?: string;
  sourceUrl?: string;
  apyHistory?: { label: string; apy: number }[];
}

export interface PortfolioSummary {
  totalUsd: number;
  earningUsd: number;
  yieldEarnedUsd: number;
}

export interface ProtocolFilter {
  name: string;
  logo: string;
  count: number;
}
