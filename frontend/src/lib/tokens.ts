// Token logos by symbol. Local files where we have them, else the Trustwallet
// asset CDN (allowed by next.config remotePatterns).
const USDC_LOGO = "/Assets/Images/Logo/logo-defi/usdc-logo.webp";
const STETH_LOGO = "/Assets/Images/Logo/logo-token/steth-logo.svg";
const TW =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

const TOKEN_LOGOS: Record<string, string> = {
  ETH: `${TW}/ethereum/info/logo.png`,
  WETH: `${TW}/ethereum/info/logo.png`,
  USDC: USDC_LOGO,
  USDT: `${TW}/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png`,
  BNB: `${TW}/smartchain/info/logo.png`,
  SOL: `${TW}/solana/info/logo.png`,
  STETH: STETH_LOGO,
  WSTETH: STETH_LOGO,
};

export function tokenLogo(symbol: string): string | undefined {
  return TOKEN_LOGOS[symbol.toUpperCase()];
}
