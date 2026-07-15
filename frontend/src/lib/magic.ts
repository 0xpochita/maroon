import { Magic } from "magic-sdk";

// Base mainnet. Magic embedded (dedicated) wallet: the EOA it creates can sign
// the EIP-7702 authorization that Universal Accounts needs.
let instance: Magic | null = null;

export function getMagic(apiKey: string): Magic | null {
  if (typeof window === "undefined") return null;
  if (!instance) {
    instance = new Magic(apiKey, {
      network: { rpcUrl: "https://mainnet.base.org", chainId: 8453 },
    });
  }
  return instance;
}
