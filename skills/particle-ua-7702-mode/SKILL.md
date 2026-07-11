---
name: particle-ua-7702-mode
description: >
  EIP-7702 mode for Particle Network Universal Accounts: upgrade a user's EOA in
  place (no new address, no migration) via a Type-4 delegation, using an
  embedded/WaaS wallet (Dynamic, Magic, Privy). Use when you want gasless,
  in-place UA on the user's existing EOA and need the enable flags, wallet
  constraints, and the authorization + send flow. For general init use
  particle-ua-sdk-reference; for concepts use particle-universal-accounts.
---

# Particle Universal Accounts: EIP-7702 Mode

## What it is

EIP-7702 mode is the default and recommended way to run a Universal Account. It
upgrades the user's existing EOA **in place** by delegating execution to
Particle's Universal Account contract through a **Type-4 transaction**. Result:
no new address, no asset migration; the EOA's existing assets are immediately
usable through the UA.

Contrast with **Smart Account (ERC-4337) mode**, where a separate smart-account
address controls execution. Use Smart Account mode when you must support plain
JSON-RPC wallets.

## Hard constraint: embedded (WaaS) wallet required

7702 needs the wallet to produce an EIP-7702 authorization signature. Standard
JSON-RPC wallets (MetaMask, Rabby, injected `window.ethereum`) **cannot** do
this: they do not expose the primitive. Use Smart Account mode for those (see
particle-ua-web-integration recipe C).

Verified-compatible embedded wallet providers:

| Provider       | Authorization signing API                | Notes                                                        |
| -------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Dynamic (WaaS) | `waasConnector.signAuthorization()`      | Guard with `isDynamicWaasConnector()` before calling        |
| Magic          | `magic.wallet.sign7702Authorization()`   | `magic.wallet.send7702Transaction()` sends the Type-4 tx    |
| Privy          | `signAuthorization()` hook               | Returns `{ r, s, yParity }`; serialize via `ethers.Signature` |

> Availability caveat: one docs page states 7702 is "only available in
> server-side environments," while the embedded-wallets page presents it as the
> client default via WaaS providers. This is version-dependent. Confirm for your
> installed SDK version and your wallet provider before shipping.

## Enable it in the constructor

```ts
import {
  UniversalAccount,
  UNIVERSAL_ACCOUNT_VERSION,
} from "@particle-network/universal-account-sdk";

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
  tradeConfig: { slippageBps: 100 },
});
```

## Delegation + send flow (6 steps)

```text
1. status  = await ua.getEIP7702Deployments()        // is the EOA delegated yet?
2. auth    = await ua.getEIP7702Auth([chainId])       // authorization params to sign
3. signed  = <provider 7702 API>(auth)                // provider-specific (table above)
4. send Type-4 tx with authorizationList              // provider-specific
5. sig     = personal_sign(transaction.rootHash)      // standard rootHash signature
6. result  = await ua.sendTransaction(transaction, sig)
```

Steps 3 and 4 are provider-specific:

- **Magic**: `magic.wallet.sign7702Authorization()` then
  `magic.wallet.send7702Transaction()` handles the Type-4 submission.
- **Dynamic**: `waasConnector.signAuthorization()` (after
  `isDynamicWaasConnector()` guard) then send with the `authorizationList`.
- **Privy**: `signAuthorization()` returns `{ r, s, yParity }`; build the
  serialized signature with `ethers.Signature` and include in the Type-4 tx.

Once delegated (step 1 reports deployed), subsequent transactions only need the
standard build -> sign `rootHash` -> `sendTransaction` flow (steps 5-6).

## Decision guide

- Consumer app, want gasless + existing-EOA-in-place + embedded login
  (Dynamic/Magic/Privy): **7702 mode**.
- Must support MetaMask/Rabby/injected wallets: **Smart Account (4337) mode**,
  see particle-ua-web-integration recipe C.
- Not sure / mixed: default to 4337 for broad wallet support, offer 7702 when an
  embedded WaaS wallet is detected.

## Source docs

- EIP-7702 embedded wallets: https://developers.particle.network/universal-accounts/ua-reference/web/eip7702-wallets
- Initialization: https://developers.particle.network/universal-accounts/ua-reference/web/initialization
- Concepts: https://developers.particle.network/intro/universal-accounts
