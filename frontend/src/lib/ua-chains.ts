// Chains where Particle Universal Accounts can execute a deposit
// (verified against @particle-network/universal-account-sdk v2.0.3 CHAIN_ID and
// the official supported-chains docs). Kept SDK-free so client components can
// import it without pulling the SDK bundle.
//
// UA supports 6 chains total; these are the EVM ones we ship vaults on:
// Ethereum, Base, Arbitrum, BNB Chain. (X Layer is UA-supported but has no
// vaults here; Solana is non-EVM.)
export const UA_CHAIN_IDS = new Set([1, 8453, 42161, 56]);

export function isUaChain(chainId?: number): boolean {
  return chainId != null && UA_CHAIN_IDS.has(chainId);
}
