---
name: particle-universal-accounts
description: >
  Foundational concepts for Particle Network Universal Accounts (chain
  abstraction). Use when deciding whether/how to give users one account and one
  balance across many chains, or when you need to understand unified balance,
  universal gas, primary assets, and the ERC-4337 vs EIP-7702 account models
  before writing integration code. For actual code, use
  particle-ua-web-integration and particle-ua-sdk-reference. For 7702 specifics,
  use particle-ua-7702-mode.
---

# Particle Network Universal Accounts: Concepts

Chain abstraction layer from Particle Network. Gives each user **one account
and one balance usable on any supported chain**, EVM or Solana. The SDK routes
liquidity, bridges assets, and pays gas automatically. Slogan: "one account,
one balance, any chain."

Production example: [UniversalX](https://universalx.app/) (Particle's own
chain-agnostic trading app built on this stack).

## Problem it solves

Traditional Web3 forces the user to:
- hold a separate wallet/balance per chain,
- bridge assets manually before acting on a new chain,
- hold the native gas token of every chain they touch.

Universal Accounts remove all three. The user acts as if the whole multi-chain
ecosystem is a single network. The SDK figures out where liquidity is, bridges
it, and settles on the destination chain, funding gas from the user's assets.

## Key concepts

- **Universal Account**: an ERC-4337 smart account coordinated across chains by
  Particle's infrastructure. Controlled by any EOA (the "owner"). Created from a
  social login, a connected wallet, or a private key.
- **Owner address**: the EOA that signs. You pass its address at init; it signs
  each transaction's `rootHash`.
- **Two UA addresses**: one EVM Universal Address and one Solana Universal
  Address per account. They are distinct because deposits work differently per
  network. Both are driven by the same UA instance. See addresses in
  particle-ua-sdk-reference.
- **Unified balance**: a single balance aggregated across chains. Transactions
  are funded from this pool; the SDK bridges as needed. Read it with
  `getPrimaryAssets()` (returns per-asset, per-chain breakdown plus a USD total).
- **Primary Assets**: a fixed set of deep-liquidity tokens the SDK uses to
  source value for any transaction, including gas. Currently ETH, USDT, USDC,
  SOL, BNB. A user can transact on a destination chain even holding nothing
  there, as long as they hold primary assets somewhere.
- **Universal gas**: gas can be paid from the unified balance / multiple gas
  tokens rather than requiring the destination chain's native token. Enabled via
  `tradeConfig.universalGas: true`.
- **Chain-agnostic transactions**: you specify a destination `chainId` and what
  tokens the action expects; the SDK sources and bridges automatically per
  transaction.

## How it works (flow)

1. **Init + account**: construct `UniversalAccount` with your Particle
   credentials and the owner EOA address. Any EOA works as signer; integrates
   into existing dApps. In EIP-7702 mode the owner EOA is upgraded in place, so
   its existing assets become usable with no migration.
2. **Cross-chain op**: user submits an intent (transfer / contract call / buy /
   sell / convert). Intent routes to Particle's settlement + liquidity layer,
   which picks optimal source chains and liquidity.
3. **Execution**: SDK bridges as needed, settles on the target chain, debits the
   unified balance, pays gas from the selected token.

## Account models: ERC-4337 vs EIP-7702

Universal Accounts are built on **ERC-4337** smart accounts and can also run in
**EIP-7702** mode.

- **Smart Account mode (ERC-4337)**: a distinct smart-account address controls
  execution. Works with standard JSON-RPC wallets (MetaMask, Rabby, etc.).
- **EIP-7702 mode**: the recommended default. Upgrades the user's existing EOA
  in place via a Type-4 transaction (delegation to Particle's UA contract). No
  new address, no asset migration. Requires an **embedded / WaaS wallet**
  (Dynamic, Magic, Privy) because plain JSON-RPC wallets cannot produce the
  authorization signature. Details and provider specifics: particle-ua-7702-mode.

> Note: docs describe 7702 as "the default and recommended way" yet also gate it
> behind embedded wallets and, in one page, server-side usage. Treat the exact
> availability as version-dependent and confirm against the live docs and the
> Particle Dashboard for your SDK version before committing to a mode.

## Supported chains and primary assets

Supported chains (per docs; may expand, verify against the dashboard):

| Chain     | Chain ID | Primary assets available |
| --------- | -------- | ------------------------ |
| Ethereum  | 1        | USDC, USDT, ETH          |
| BNB Chain | 56       | USDC, USDT, ETH, BNB     |
| X Layer   | 196      | (see docs)               |
| Base      | 8453     | USDC, ETH                |
| Arbitrum  | 42161    | USDC, USDT, ETH          |
| Solana    | 101      | USDC, USDT, SOL          |

Primary assets overall: **ETH, USDT, USDC, SOL, BNB**.

Transaction **destination** chains can be broader than the primary-asset chains
above (SDK examples target e.g. Avalanche and Base via the `CHAIN_ID` enum).
Primary assets are what the SDK draws on to fund and bridge; the destination is
wherever your `chainId` points.

## Credentials required

From the [Particle Dashboard](https://dashboard.particle.network/): `projectId`,
`projectClientKey` (client key), `projectAppUuid` (app id). Passed to the
`UniversalAccount` constructor. In web apps expose them as `NEXT_PUBLIC_*` (they
are client keys, not secrets); never expose an owner private key client-side.

## When to use the sibling skills

- Building the integration (Node, Particle Auth, browser wallet, Particle
  Connect) with full code: **particle-ua-web-integration**.
- Exact SDK API (constructor config, methods, types, response shapes):
  **particle-ua-sdk-reference**.
- Turning on gasless in-place EOA upgrade via embedded wallets:
  **particle-ua-7702-mode**.

## Source docs

- Intro: https://developers.particle.network/intro/universal-accounts
- Overview: https://developers.particle.network/universal-accounts/overview
- Supported chains: https://developers.particle.network/universal-accounts/chains
- Full LLM index: https://developers.particle.network/llms.txt
