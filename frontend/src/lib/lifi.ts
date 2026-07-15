import { vaults as mockVaults } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";

const EARN_BASE = "https://earn.li.fi/v1";

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  42161: "Arbitrum",
  10: "Optimism",
  137: "Polygon",
  56: "BNB Chain",
  43114: "Avalanche",
};

export const USDC_BY_ID: Record<number, string> = {
  1: "0xA0b86991c6218b36c1D19D4a2e9Eb0cE3606eB48",
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
};

// Arbitrum first, then other popular EVM chains. One fetch per chain so each is
// represented in the grid and the chain filter.
const POPULAR_CHAINS = [42161, 8453, 1, 10, 137, 56, 43114];

// Stablecoin assets to pull per chain. USDe surfaces Ethena's synthetic-dollar
// yield vaults; USDC/USDT cover lending. LI.FI matches on token symbol.
const ASSETS = ["USDC", "USDT", "USDe"];

const STABLES = new Set([
  "USDC",
  "USDT",
  "DAI",
  "USDE",
  "SUSDE",
  "USDS",
  "GHO",
  "FRAX",
  "USR",
  "RLUSD",
  "USD0",
]);

const USDE_LOGO = "/Assets/Images/Logo/logo-token/usde-logo.svg";

// LI.FI often omits protocol.logoUri; fall back to local logos for the ones we
// ship. Unknown protocols render initials in VaultAvatar.
const LOGO_DIR = "/Assets/Images/Logo/logo-defi";
const PROTOCOL_LOGOS: Record<string, string> = {
  aave: `${LOGO_DIR}/aave-logo.webp`,
  morpho: `${LOGO_DIR}/morpho-logo.webp`,
  euler: `${LOGO_DIR}/euler-logo.png`,
  "euler finance": `${LOGO_DIR}/euler-logo.png`,
  lido: `${LOGO_DIR}/lido-logo.svg`,
  fluid: `${LOGO_DIR}/fluid-logo.png`,
  ethena: `${LOGO_DIR}/ethena-logo.webp`,
};

// Lido liquid staking. "Buy" wstETH easily: the Earn deposit routes USDC to the
// wstETH token via LI.FI (a normal swap), sourced cross-chain by the Universal
// Account. Addresses from docs.lido.fi/deployed-contracts.
const LIDO_LOGO = "/Assets/Images/Logo/logo-defi/lido-logo.svg";
const STETH_LOGO = "/Assets/Images/Logo/logo-token/steth-logo.svg";

function lidoVault(chainId: number, wsteth: string, tvlUsd: number): Vault {
  return {
    id: `lido-wsteth-${chainId}`,
    name: "Lido Staked ETH (wstETH)",
    vaultAddress: wsteth,
    chainId,
    tokenAddress: USDC_BY_ID[chainId] ?? "",
    asset: "wstETH",
    assetLogo: STETH_LOGO,
    protocol: { name: "Lido", logo: LIDO_LOGO, url: "https://stake.lido.fi" },
    sourceUrl: "https://stake.lido.fi",
    chain: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
    apy: 3.0,
    apyHistory: [
      { label: "30d", apy: 3.0 },
      { label: "7d", apy: 3.0 },
      { label: "1d", apy: 3.0 },
      { label: "Now", apy: 3.0 },
    ],
    tvlUsd,
    categories: ["liquid-staking", "low-risk"],
  };
}

const LIDO_VAULTS: Vault[] = [
  lidoVault(1, "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", 25_000_000_000),
  lidoVault(42161, "0x5979D7b546E38E414F7E9822514be443A4800529", 220_000_000),
  lidoVault(8453, "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", 160_000_000),
];

// Tags matched to the category tabs. Risk is inferred from APY plus whether the
// protocol is a well-known blue chip.
const BLUE_CHIP = /aave|lido|morpho|gauntlet|steakhouse|spark|compound/i;

function deriveCategories(symbol: string, apy: number, protocol: string) {
  const cats = ["lending"];
  if (STABLES.has(symbol.toUpperCase())) cats.push("stablecoins");
  const bluechip = BLUE_CHIP.test(protocol);
  if (apy >= 5) cats.push("best-yield");
  if (apy >= 6 && !bluechip) {
    cats.push("high-risk");
  } else {
    cats.push("low-risk");
  }
  return [...new Set(cats)];
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Vault names from the API are often ALL CAPS symbols (e.g. "STEAKUSDC").
// Capitalize the first letter only, then split off + uppercase known token
// tickers so "STEAKUSDC" reads as "Steak USDC".
function prettyName(value: string) {
  if (!value) return value;
  let v = value;
  const allCaps = v === v.toUpperCase() && /[A-Z]/.test(v);
  if (allCaps) v = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  v = v.replace(/usdc/gi, " USDC").replace(/usdt/gi, " USDT");
  return v.replace(/\s+/g, " ").trim();
}

// Friendly names for vault symbols that are otherwise cryptic.
const NAME_MAP: Record<string, string> = {
  gtusdcp: "Gauntlet USDC Prime",
  gtusdc: "Gauntlet USDC",
  gtusdcc: "Gauntlet USDC Core",
  susde: "Staked USDe",
  usde: "USDe",
  susds: "Staked USDS",
};

function niceName(raw: string) {
  const key = raw.toLowerCase().replace(/\s+/g, "");
  return NAME_MAP[key] ?? prettyName(raw);
}

// The API returns apy.total; docs show a fraction (0.0534 = 5.34%) but live data
// returns an already-multiplied percent (5.34). Normalize both: values < 1 are
// fractions, values >= 1 are already percent.
function normalizeApy(raw: number) {
  return raw >= 1 ? raw : raw * 100;
}

// LI.FI has no per-vault link, only the protocol homepage. Build a deep link to
// the specific vault where the protocol's URL scheme is known; else homepage.
function vaultSourceUrl(
  pname: string,
  chainName: string,
  address: string,
  homepage: string,
) {
  const p = pname.toLowerCase();
  const net = chainName.toLowerCase();
  if (p.includes("morpho")) {
    return `https://app.morpho.org/${net}/vault/${address}`;
  }
  if (p.includes("euler")) {
    return `https://app.euler.finance/vault/${address}`;
  }
  return homepage;
}

// biome-ignore lint/suspicious/noExplicitAny: LI.FI vault json is untyped
function mapVault(v: any): Vault {
  const chainId = Number(v.chainId);
  const token = v.underlyingTokens?.[0] ?? {};
  const symbol = String(token.symbol ?? "USDC");
  const pname = String(v.protocol?.name ?? v.name ?? "Vault");
  const chainName = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
  const homepage = String(v.protocol?.url ?? "");
  const address = String(v.address);
  const analytics = v.analytics ?? {};
  const apyNow = normalizeApy(Number(analytics.apy?.total ?? 0));
  const apyAt = (val: unknown) =>
    normalizeApy(Number(val ?? analytics.apy?.total ?? 0));
  return {
    id: address,
    name: niceName(String(v.name ?? "")),
    vaultAddress: address,
    chainId,
    tokenAddress: String(token.address ?? ""),
    asset: symbol.toUpperCase(),
    assetLogo:
      String(token.logoURI ?? "") ||
      (symbol.toUpperCase() === "USDE" ? USDE_LOGO : ""),
    protocol: {
      name: titleCase(pname),
      logo:
        String(v.protocol?.logoUri ?? "") ||
        PROTOCOL_LOGOS[pname.toLowerCase()] ||
        "",
      url: homepage,
    },
    chain: chainName,
    sourceUrl: vaultSourceUrl(pname, chainName, address, homepage),
    apy: apyNow,
    apyHistory: [
      { label: "30d", apy: apyAt(analytics.apy30d) },
      { label: "7d", apy: apyAt(analytics.apy7d) },
      { label: "1d", apy: apyAt(analytics.apy1d) },
      { label: "Now", apy: apyNow },
    ],
    tvlUsd: Number(analytics.tvl?.usd ?? 0),
    categories: deriveCategories(symbol, apyNow, pname),
  };
}

async function fetchChainVaults(
  chainId: number,
  asset: string,
  key: string,
): Promise<Vault[]> {
  try {
    const url = new URL(`${EARN_BASE}/vaults`);
    url.searchParams.set("chainId", String(chainId));
    url.searchParams.set("asset", asset);
    url.searchParams.set("sortBy", "tvl");
    url.searchParams.set("minTvlUsd", "1000000");
    url.searchParams.set("limit", "8");
    const res = await fetch(url, {
      headers: { "x-lifi-api-key": key },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // biome-ignore lint/suspicious/noExplicitAny: LI.FI response is untyped
    const list: any[] = Array.isArray(data)
      ? data
      : (data?.vaults ?? data?.data ?? []);
    return list
      .filter((v) => v?.isTransactional !== false && v?.address)
      .map(mapVault)
      .filter((v: Vault) => v.apy > 0);
  } catch (error) {
    console.error(`LI.FI fetch chain ${chainId} failed`, error);
    return [];
  }
}

// Server-only: reads LIFI_API_KEY. Falls back to mock vaults when the key is
// missing or every request fails, so the UI always renders.
export async function fetchVaults(): Promise<Vault[]> {
  const key = process.env.LIFI_API_KEY;
  if (!key) return [...mockVaults, ...LIDO_VAULTS];
  const results = await Promise.all(
    POPULAR_CHAINS.flatMap((chainId) =>
      ASSETS.map((asset) => fetchChainVaults(chainId, asset, key)),
    ),
  );
  // Dedupe by vault address (a vault can match more than one asset query).
  const seen = new Map<string, Vault>();
  for (const v of results.flat()) {
    if (!seen.has(v.id)) seen.set(v.id, v);
  }
  const merged = [...seen.values()].sort((a, b) => b.tvlUsd - a.tvlUsd);
  return [...(merged.length ? merged : mockVaults), ...LIDO_VAULTS];
}

export async function getVaultById(id: string): Promise<Vault | undefined> {
  const all = await fetchVaults();
  return all.find((v) => v.id === id || v.vaultAddress === id);
}

export interface Position {
  vaultAddress: string;
  chainId: number;
  chain: string;
  protocol: string;
  logo: string;
  asset: string;
  name?: string;
  balanceUsd: number;
  apy?: number;
}

// Client-side: fetches the server portfolio route (which holds the key).
export async function getPositions(address: string): Promise<Position[]> {
  try {
    const res = await fetch(`/api/lifi/portfolio/${address}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.positions ?? [];
  } catch (error) {
    console.error("getPositions failed", error);
    return [];
  }
}
