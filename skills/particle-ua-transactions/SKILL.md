---
name: particle-ua-transactions
description: >
  All Particle Network Universal Accounts transaction builders: transfer,
  custom contract call, buy, sell, convert, Solana, and fee preview. Use when
  implementing swaps/trading, contract interactions, or a fee estimate UI. Every
  builder shares build -> sign rootHash -> sendTransaction. For init/config use
  particle-ua-sdk-reference; for signer wiring use particle-ua-web-integration.
---

# Particle Universal Accounts: Transactions

Every builder returns an object with a `rootHash`. Same three steps always:

```ts
const tx = await ua.createXxxTransaction({ /* ... */ });
const signature = await SIGN(tx.rootHash);      // signer-specific, see web-integration
const result = await ua.sendTransaction(tx, signature);
// https://universalx.app/activity/details?id=${result.transactionId}
```

`amount` fields are human-readable strings. Native token address is
`0x0000000000000000000000000000000000000000`.

## createTransferTransaction

Send a token to any address on any supported chain (recap; full detail in
particle-ua-sdk-reference).

```ts
const tx = await ua.createTransferTransaction({
  token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" },
  amount: "0.1",
  receiver: receiverAddress,
});
```

## createUniversalTransaction

Arbitrary contract call; SDK sources the tokens the call expects.

```ts
import { Interface, parseEther, toBeHex } from "ethers";
const iface = new Interface(["function checkIn() public payable"]);

const tx = await ua.createUniversalTransaction({
  chainId: CHAIN_ID.BASE_MAINNET,
  expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.ETH, amount: "0.0000001" }],
  transactions: [
    { to: contractAddress, data: iface.encodeFunctionData("checkIn"), value: toBeHex(parseEther("0.0000001")) },
  ],
});
```

## createBuyTransaction

Buy a target token, paying a **USD amount** drawn from primary assets. Source
tokens can be restricted via `tradeConfig.usePrimaryTokens` at init.

```ts
const tx = await ua.createBuyTransaction({
  token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" },
  amountInUSD: "10", // note: USD, not token units
});
```

## createSellTransaction

Sell `amount` of a token. Optional second arg picks what you receive.

```ts
import { PREFER_TOKEN_TYPE } from "@particle-network/universal-account-sdk";

const tx = await ua.createSellTransaction(
  { token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0x912CE59144191C1204E64559FE8253a0e49E6548" }, amount: "1" },
  { preferTokenType: PREFER_TOKEN_TYPE.USD }, // optional
);
```

`PREFER_TOKEN_TYPE`: `USD` (0) receive USDC stablecoin; `NATIVE` (1) receive the
chain's native token (ETH, BNB, ...).

## createConvertTransaction

Convert between primary assets. Specify the target (`expectToken`) and chain.

```ts
const tx = await ua.createConvertTransaction({
  expectToken: { type: SUPPORTED_TOKEN_TYPE.USDC, amount: "1" }, // target you want to end up with
  chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
});
```

## Solana transactions

Buy SOL or any Solana token with `createBuyTransaction`, using the Solana chain
id and the token **mint address**. Works even if the UA holds no SOL for gas
(cross-chain routing funds it).

```ts
const tx = await ua.createBuyTransaction({
  token: { chainId: CHAIN_ID.SOLANA_MAINNET, address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN" }, // mint
  amountInUSD: "0.001",
});
// sign rootHash + sendTransaction as usual
```

## Fee preview (before confirm)

The built transaction already carries a preview. Read `feeQuotes[0].fees.totals`.
Fee values are fixed-point with 18 decimals; format with `formatUnits(x, 18)`.

```ts
import { formatUnits } from "ethers";

const totals = tx.feeQuotes[0].fees.totals;
console.log("Total fee USD:", `$${formatUnits(totals.feeTokenAmountInUSD, 18)}`);
console.log("Gas fee USD:", `$${formatUnits(totals.gasFeeTokenAmountInUSD, 18)}`);
console.log("Service fee USD:", `$${formatUnits(totals.transactionServiceFeeTokenAmountInUSD, 18)}`);
console.log("LP fee USD:", `$${formatUnits(totals.transactionLPFeeTokenAmountInUSD, 18)}`);
```

`fees.totals` fields: `feeTokenAmountInUSD`, `gasFeeTokenAmountInUSD`,
`transactionServiceFeeTokenAmountInUSD`, `transactionLPFeeTokenAmountInUSD`. The
transaction object also exposes sender/recipient, tokens used, and estimated
fees for a confirm UI. The final `sendTransaction` result has the full fee and
token-change breakdown (see particle-ua-sdk-reference `TransactionResult`).

## Amount cheat sheet

| Builder                     | Amount field       | Meaning                          |
| --------------------------- | ------------------ | -------------------------------- |
| transfer                    | `amount`           | token units to send              |
| buy                         | `amountInUSD`      | USD worth to buy                 |
| sell                        | `amount`           | token units to sell              |
| convert                     | `expectToken.amount` | target amount to end up with   |
| universal (contract)        | `expectTokens[].amount` | token units the call needs  |

## Source docs

- Transfer: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/transfer
- Custom: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/custom
- Buy: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/buy
- Sell: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/sell
- Convert: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/conversion
- Solana: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/solana
- Preview: https://developers.particle.network/universal-accounts/ua-reference/web/transactions/preview
