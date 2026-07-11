---
name: particle-ua-sdk-reference
description: >
  Exact API surface of the Particle Network Universal Accounts web SDK
  (@particle-network/universal-account-sdk): constructor config, methods,
  enums, and return/response shapes. Use when writing or debugging UA code and
  you need precise names, parameters, and types. For end-to-end integration
  recipes use particle-ua-web-integration; for concepts use
  particle-universal-accounts.
---

# Particle Universal Accounts: Web SDK Reference

Package: `@particle-network/universal-account-sdk`. Peer: `ethers` (v6) for the
Node/EOA flows and encoding helpers (`Interface`, `parseEther`, `toBeHex`,
`getBytes`).

```bash
npm install @particle-network/universal-account-sdk ethers
```

## Exports used

```ts
import {
  UniversalAccount,
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
  UNIVERSAL_ACCOUNT_VERSION,
} from "@particle-network/universal-account-sdk";
```

## Constructor

```ts
const ua = new UniversalAccount(config);
```

`config` fields:

| Field                        | Type     | Required | Notes                                                        |
| ---------------------------- | -------- | -------- | ------------------------------------------------------------ |
| `projectId`                  | string   | yes      | Particle Dashboard project id                                |
| `projectClientKey`           | string   | yes      | Client key                                                   |
| `projectAppUuid`             | string   | yes      | App id (UUID)                                                |
| `ownerAddress`               | string   | see note | Owner EOA address (top-level form)                           |
| `tradeConfig`                | object   | no       | Trade / routing options (below)                              |
| `smartAccountOptions`        | object   | see note | Alternative to `ownerAddress`; enables 7702 (below)          |

Two mutually understood ways to declare the owner:

**A. Simple (default, most examples):**

```ts
const ua = new UniversalAccount({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
  ownerAddress: wallet.address,
  tradeConfig: {
    slippageBps: 100, // 1% = 100 bps
    universalGas: true, // pay gas from unified balance
  },
});
```

**B. Explicit smart-account options (7702):**

```ts
const ua = new UniversalAccount({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
  smartAccountOptions: {
    useEIP7702: true,
    name: "UNIVERSAL",
    version: UNIVERSAL_ACCOUNT_VERSION,
    ownerAddress: wallet.address,
  },
  tradeConfig: {
    slippageBps: 100,
    usePrimaryTokens: [SUPPORTED_TOKEN_TYPE.SOL],
  },
});
```

`tradeConfig` fields seen:

| Field              | Type                    | Notes                                              |
| ------------------ | ----------------------- | -------------------------------------------------- |
| `slippageBps`      | number                  | Slippage tolerance in basis points (100 = 1%)      |
| `universalGas`     | boolean                 | Pay gas from unified balance / multiple tokens     |
| `usePrimaryTokens` | SUPPORTED_TOKEN_TYPE[]  | Restrict swap/source logic to specific tokens      |

`smartAccountOptions` fields: `useEIP7702` (boolean), `name` (string, e.g.
`"UNIVERSAL"`), `version` (use the `UNIVERSAL_ACCOUNT_VERSION` constant),
`ownerAddress` (string).

## Methods

### getSmartAccountOptions()

Returns the owner and both Universal Addresses.

```ts
const opts = await ua.getSmartAccountOptions();
const accountInfo = {
  ownerAddress: opts.ownerAddress,               // EOA
  evmUaAddress: opts.smartAccountAddress!,        // EVM Universal Address
  solanaUaAddress: opts.solanaSmartAccountAddress!, // Solana Universal Address
};
```

### getPrimaryAssets()

Unified balance across chains.

```ts
const primaryAssets = await ua.getPrimaryAssets();
console.log("Unified balance USD:", primaryAssets.totalAmountInUSD);
```

Return shape:

```ts
{
  assets: AssetInfo[];
  totalAmountInUSD: number;
}

// AssetInfo
{
  tokenType: string;      // "eth" | "usdt" | ...
  price: number;          // USD price
  amount: number;         // human-readable, summed across chains
  amountInUSD: number;
  chainAggregation: ChainAggregation[];
}

// ChainAggregation
{
  token: {
    chainId: number;
    address: string;      // 0x000...000 for native
    decimals: number;
    realDecimals: number;
    isMultiChain: boolean;
    isMultiChainDefault: boolean;
  };
  amount: number;         // human-readable
  amountInUSD: number;
  rawAmount: string;      // integer base units, stringified
}
```

### createTransferTransaction(params)

Send a token to any address on any supported chain.

```ts
const tx = await ua.createTransferTransaction({
  token: {
    chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT here; 0x000..0 for native
  },
  amount: "0.1",          // human-readable string
  receiver: receiverAddress,
});
// tx.rootHash -> sign -> sendTransaction
```

### createUniversalTransaction(params)

Arbitrary contract calls (including payable), with the SDK sourcing the tokens
the call expects.

```ts
import { Interface, parseEther, toBeHex } from "ethers";

const iface = new Interface(["function checkIn() public payable"]);

const tx = await ua.createUniversalTransaction({
  chainId: CHAIN_ID.BASE_MAINNET,
  expectTokens: [
    { type: SUPPORTED_TOKEN_TYPE.ETH, amount: "0.0000001" },
  ],
  transactions: [
    {
      to: "0x14dcD77D7C9DA51b83c9F0383a995c40432a4578",
      data: iface.encodeFunctionData("checkIn"),
      value: toBeHex(parseEther("0.0000001")),
    },
  ],
});
```

Params: `chainId` (destination), `expectTokens: [{ type, amount }]` (what the
action needs; SDK bridges/sources it), `transactions: [{ to, data, value }]`
(standard call objects; empty array is allowed when you only need `expectTokens`
moved to the chain).

### Other builders (same sign+send flow)

- `createBuyTransaction()` - buy a token with primary assets.
- `createSellTransaction()` - sell a token to primary assets.
- `createConvertTransaction()` - convert between assets.

Docs: `.../ua-reference/web/transactions/{buy,sell,conversion,solana}`.

### sendTransaction(transaction, signature)

Broadcasts a built transaction after the owner signs its `rootHash`.

```ts
const result = await ua.sendTransaction(transaction, signature);
// activity link:
`https://universalx.app/activity/details?id=${result.transactionId}`
```

`TransactionResult` (partial; see send-response docs for full tree):

- Top level: `transactionId`, `mode` (mainnet/testnet), `sender`, `receiver`,
  `type`, `status`, `tag`, `created_at`, `updated_at`.
- `fees`: `totals.feeTokenAmountInUSD`, `feeTokens[]`, `freeGasFee`,
  `freeServiceFee`.
- `depositTokens[]`, `lendingTokens[]`: `symbol`, `chainId`, `amount`,
  `amountInUSD`.
- `tokenChanges`: `decr[]` (spent), `incr[]` (received), `swaps[]` (route),
  `tokenBalances[]` (post-tx).
- Analytics: `slippage`, `totalFeeInUSD`, `totalDecrAmountInUSD`,
  `totalIncrAmountInUSD`, `priceImpact`, `minReceiveAmountInUSD`,
  `minReceiveToken`.

### EIP-7702 helpers

- `ua.getEIP7702Deployments()` - check delegation status.
- `ua.getEIP7702Auth([chainId])` - get authorization params to sign.

See particle-ua-7702-mode for the full Type-4 flow.

## Signing the rootHash (critical, signer-specific)

Every builder returns an object with `rootHash`. Signing differs by signer;
getting this wrong is the most common integration bug. Full matrix in
particle-ua-web-integration. Quick reference:

```ts
// ethers Wallet (Node): rootHash is a hex string -> sign raw bytes
const signature = await wallet.signMessage(getBytes(transaction.rootHash));

// ethers BrowserProvider signer
const signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
const signature = await signer.signMessage(transaction.rootHash);

// Particle Auth provider (useEthereum().provider)
const signature = await provider.signMessage(transaction.rootHash);

// Particle Connect / viem walletClient
const signature = await walletClient.signMessage({
  account: address as `0x${string}`,
  message: { raw: transaction.rootHash },
});
```

## Enums

`CHAIN_ID` (members observed; more exist for destinations):

| Member                     | Chain ID |
| -------------------------- | -------- |
| `ETHEREUM_MAINNET` (1)     | 1        |
| `BSC_MAINNET` / BNB        | 56       |
| `X_LAYER_MAINNET`          | 196      |
| `BASE_MAINNET`             | 8453     |
| `ARBITRUM_MAINNET_ONE`     | 42161    |
| `AVALANCHE_MAINNET`        | 43114    |
| `SOLANA_MAINNET`           | 101      |

Confirm exact member spellings against the installed package's types; the
examples use `CHAIN_ID.ARBITRUM_MAINNET_ONE`, `CHAIN_ID.BASE_MAINNET`,
`CHAIN_ID.AVALANCHE_MAINNET`.

`SUPPORTED_TOKEN_TYPE`: `ETH`, `USDT`, `USDC`, `SOL`, `BNB`.

## Source docs

- Initialization: https://developers.particle.network/universal-accounts/ua-reference/web/initialization
- Addresses: https://developers.particle.network/universal-accounts/ua-reference/web/addresses
- Balances: https://developers.particle.network/universal-accounts/ua-reference/web/balances
- Transfer: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/transfer
- Custom: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/custom
- send response: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/send-response
- REST API: https://developers.particle.network/universal-accounts/ua-reference/apis/ua
