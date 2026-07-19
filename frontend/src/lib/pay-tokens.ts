// Source tokens the user can pay a deposit with (Particle UA Primary Assets).
// LI.FI + the Universal Account convert/route to the vault's asset. SDK-free so
// it can be imported anywhere. `stable` tokens are denominated in USD ($, 1:1);
// the rest are denominated in their own units. `nativeChainId` is set when the
// token lives on a specific chain (used to build the LI.FI quote's fromChain).
export interface PayToken {
  symbol: string;
  decimals: number;
  stable: boolean;
  chips: number[];
  nativeChainId?: number;
}

export const PAY_TOKENS: PayToken[] = [
  { symbol: "USDC", decimals: 6, stable: true, chips: [5, 10, 100, 200, 500] },
  { symbol: "USDT", decimals: 6, stable: true, chips: [5, 10, 100, 200, 500] },
  {
    symbol: "ETH",
    decimals: 18,
    stable: false,
    chips: [0.005, 0.01, 0.05, 0.1, 0.5],
  },
  {
    symbol: "BNB",
    decimals: 18,
    stable: false,
    chips: [0.01, 0.05, 0.1, 0.5, 1],
    nativeChainId: 56,
  },
  {
    symbol: "SOL",
    decimals: 9,
    stable: false,
    chips: [0.1, 0.5, 1, 5, 10],
    nativeChainId: 101,
  },
];

export function payToken(symbol?: string): PayToken {
  const s = (symbol ?? "").toUpperCase();
  return PAY_TOKENS.find((t) => t.symbol === s) ?? PAY_TOKENS[0];
}
