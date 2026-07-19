// Block explorer per chain + LI.FI cross-chain scan. SDK-free.
const EXPLORERS: Record<number, { name: string; tx: string }> = {
  1: { name: "Etherscan", tx: "https://etherscan.io/tx/" },
  42161: { name: "Arbiscan", tx: "https://arbiscan.io/tx/" },
  8453: { name: "Basescan", tx: "https://basescan.org/tx/" },
  10: { name: "Optimism", tx: "https://optimistic.etherscan.io/tx/" },
  137: { name: "Polygonscan", tx: "https://polygonscan.com/tx/" },
  56: { name: "BscScan", tx: "https://bscscan.com/tx/" },
  43114: { name: "Snowtrace", tx: "https://snowtrace.io/tx/" },
};

export function explorerTx(chainId?: number, hash?: string) {
  if (!chainId || !hash) return undefined;
  const e = EXPLORERS[chainId];
  return e ? { name: e.name, url: `${e.tx}${hash}` } : undefined;
}

export function lifiScanTx(hash?: string) {
  return hash ? `https://scan.li.fi/tx/${hash}` : undefined;
}

export function shortenHash(hash?: string) {
  if (!hash) return "";
  return hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : hash;
}
