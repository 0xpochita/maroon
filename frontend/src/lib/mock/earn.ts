import type {
  EarnPlan,
  PortfolioSummary,
  Protocol,
  ProtocolFilter,
  Vault,
} from "@/types/earn";

const LOGO_BASE = "/Assets/Images/Logo/logo-defi";

const aave: Protocol = { name: "Aave", logo: `${LOGO_BASE}/aave-logo.webp` };
const morpho: Protocol = {
  name: "Morpho",
  logo: `${LOGO_BASE}/morpho-logo.webp`,
};
const euler: Protocol = {
  name: "Euler Finance",
  logo: `${LOGO_BASE}/euler-logo.png`,
};

const usdcLogo = `${LOGO_BASE}/usdc-logo.webp`;

const CHAIN_BASE = "/Assets/Images/Logo/logo-chain";

export const chainLogos: Record<string, string> = {
  Base: `${CHAIN_BASE}/base-logo.jpg`,
  Arbitrum: `${CHAIN_BASE}/arb-logo.svg`,
};

export const earnPlans: EarnPlan[] = [
  {
    id: "safe",
    name: "Safe",
    tagline: "Stablecoin lending on blue-chip protocols.",
    apy: 5.8,
    risk: "safe",
    tvlUsd: 18_200_000,
    asset: "USDC",
    assetLogo: usdcLogo,
    allocations: [{ protocol: aave, chain: "Base", apy: 5.8 }],
  },
  {
    id: "balanced",
    name: "Balanced",
    tagline: "Diversified stablecoin yield across lending markets.",
    apy: 11.4,
    risk: "balanced",
    tvlUsd: 9_600_000,
    asset: "USDC",
    assetLogo: usdcLogo,
    allocations: [
      { protocol: aave, chain: "Base", apy: 6.1 },
      { protocol: morpho, chain: "Base", apy: 9.2 },
    ],
  },
  {
    id: "degen",
    name: "Degen",
    tagline: "Higher-yield markets for bigger upside.",
    apy: 23.7,
    risk: "degen",
    tvlUsd: 3_100_000,
    asset: "USDC",
    assetLogo: usdcLogo,
    allocations: [
      { protocol: morpho, chain: "Base", apy: 14.8 },
      { protocol: euler, chain: "Base", apy: 23.7 },
    ],
  },
];

export const vaults: Vault[] = [
  {
    id: "usdc-aave-base",
    asset: "USDC",
    assetLogo: usdcLogo,
    protocol: aave,
    chain: "Base",
    apy: 5.8,
    tvlUsd: 42_300_000,
  },
  {
    id: "usdc-morpho-base",
    asset: "USDC",
    assetLogo: usdcLogo,
    protocol: morpho,
    chain: "Base",
    apy: 9.2,
    tvlUsd: 15_100_000,
  },
  {
    id: "usdc-euler-base",
    asset: "USDC",
    assetLogo: usdcLogo,
    protocol: euler,
    chain: "Base",
    apy: 12.1,
    tvlUsd: 6_400_000,
  },
  {
    id: "usdc-aave-arb",
    asset: "USDC",
    assetLogo: usdcLogo,
    protocol: aave,
    chain: "Arbitrum",
    apy: 6.4,
    tvlUsd: 28_900_000,
  },
  {
    id: "usdc-morpho-eth",
    asset: "USDC",
    assetLogo: usdcLogo,
    protocol: morpho,
    chain: "Ethereum",
    apy: 8.1,
    tvlUsd: 19_700_000,
  },
  {
    id: "usdc-euler-arb",
    asset: "USDC",
    assetLogo: usdcLogo,
    protocol: euler,
    chain: "Arbitrum",
    apy: 14.3,
    tvlUsd: 3_200_000,
  },
];

export const portfolio: PortfolioSummary = {
  totalUsd: 1284.52,
  earningUsd: 1000,
  yieldEarnedUsd: 12.84,
};

export const protocolFilters: ProtocolFilter[] = [
  { name: "Aave", logo: aave.logo, count: 8 },
  { name: "Morpho", logo: morpho.logo, count: 6 },
  { name: "Euler Finance", logo: euler.logo, count: 4 },
];

export const totalVaultCount = 24;

export const categories = [
  "Trending",
  "Stablecoins",
  "ETH",
  "Lending",
  "LP",
  "Restaking",
  "RWA",
  "New",
];
