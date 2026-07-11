---
name: particle-ua-patterns
description: >
  Practical UX patterns for Particle Network Universal Accounts: funding /
  deposit flow (get assets into a UA), withdraw back to an EOA, and a balance
  breakdown widget. Use when building the deposit/withdraw UX or a portfolio
  view. For the raw builders use particle-ua-transactions; for API shapes use
  particle-ua-sdk-reference.
---

# Particle Universal Accounts: UX Patterns

## Funding a Universal Account (deposit)

Two ways to get value into a UA:

1. **Direct deposit**: send supported tokens to the account's Universal Address.
   Get it from `getSmartAccountOptions()` (EVM `smartAccountAddress`, Solana
   `solanaSmartAccountAddress`). EVM and Solana addresses differ; deposit to the
   one matching the source network.
2. **Scan-and-deposit flow**: connect the user's EOA, scan it for USDC/USDT
   across supported chains, let the user pick amounts, and pull them into the UA
   with no manual bridging.

```ts
const opts = await ua.getSmartAccountOptions();
const depositEvm = opts.smartAccountAddress;       // send EVM assets here
const depositSol = opts.solanaSmartAccountAddress; // send Solana assets here
```

## Withdraw back to an EOA

Move funds from the UA out to a normal wallet with `createUniversalTransaction`:
target chain, `expectTokens` for what to deliver, and a plain value transfer to
the EOA (`data: "0x"`).

```ts
import { ethers, parseEther, toBeHex } from "ethers";
import { CHAIN_ID, SUPPORTED_TOKEN_TYPE } from "@particle-network/universal-account-sdk";

const tx = await ua.createUniversalTransaction({
  chainId: CHAIN_ID.BSC_MAINNET,
  expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.BNB, amount: bnbAmount }],
  transactions: [
    { to: walletAddress, data: "0x", value: toBeHex(parseEther(bnbAmount)) },
  ],
});

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const signature = await signer.signMessage(ethers.getBytes(tx.rootHash));
const result = await ua.sendTransaction(tx, signature);
```

Reference demo: https://github.com/soos3d/universal-accounts-flow-demo

## Balance breakdown widget

Two read methods exist:

- `getPrimaryAssets()` - unified balance limited to primary assets (ETH, USDT,
  USDC, SOL, BNB) plus `totalAmountInUSD`.
- `getAssets()` - the fuller list of tokens with aggregated cross-chain balances.

Both return the same item shape (`tokenType`, `price`, `amount`, `amountInUSD`,
`chainAggregation[]`). Use `getPrimaryAssets` for the spendable balance headline;
use `getAssets` for a complete portfolio view.

```ts
const { assets, totalAmountInUSD } = await ua.getPrimaryAssets();

const rows = assets
  .filter((a) => a.amountInUSD > 0)          // drop dust / invalid
  .sort((a, b) => b.amountInUSD - a.amountInUSD); // highest value first

for (const a of rows) {
  // headline row
  console.log(a.tokenType, a.amount, `$${a.amountInUSD.toFixed(2)}`);
  // per-chain breakdown
  for (const c of a.chainAggregation) {
    console.log("  chain", c.token.chainId, c.amount, `$${c.amountInUSD.toFixed(2)}`);
  }
}
```

The docs ship a `WalletWidget` React component (ShadCN `Card`, Lucide `Wallet`
icon, token images at `/public/tokens/[symbol].png`) that filters zero balances,
sorts by USD desc, formats currency, and shows the portfolio total. Feed it the
`getPrimaryAssets()` result:

```tsx
const primaryAssets = await ua.getPrimaryAssets();
<WalletWidget assets={primaryAssets.assets} totalAmountInUSD={primaryAssets.totalAmountInUSD} />
```

## Other how-to guides

- Convert assets: `createConvertTransaction` (see particle-ua-transactions).
- Preview a transaction before confirm: `feeQuotes[0].fees.totals` (see
  particle-ua-transactions).

## Source docs

- Deposit flow: https://developers.particle.network/universal-accounts/how-to/deposit-flow
- Balances widget: https://developers.particle.network/universal-accounts/how-to/balances
- How-to overview: https://developers.particle.network/universal-accounts/how-to/overview
- Conversions: https://developers.particle.network/universal-accounts/how-to/conversions
- Tx preview: https://developers.particle.network/universal-accounts/how-to/tx-preview
