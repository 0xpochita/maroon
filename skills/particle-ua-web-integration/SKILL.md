---
name: particle-ua-web-integration
description: >
  Copy-ready recipes to integrate Particle Network Universal Accounts in
  web/Node apps: install, init, connect a signer (Node ethers wallet, Particle
  Auth social login, injected browser wallet, Particle Connect), read the
  unified balance, and send transfers and contract calls. Use when actually
  wiring UA into a Next.js/React app or a backend script. For the raw API use
  particle-ua-sdk-reference; for concepts use particle-universal-accounts.
---

# Particle Universal Accounts: Web Integration

Four signer paths, one SDK. Pick the signer that matches your app; the
build-sign-send flow is identical after that.

## Install

```bash
npm install @particle-network/universal-account-sdk ethers
# social login path also:
npm install @particle-network/authkit
# Particle Connect path instead:
npm install @particle-network/connectkit
```

## Credentials / env

From https://dashboard.particle.network/ : project id, client key, app id.
These are client-safe keys (not secrets); in Next.js expose with `NEXT_PUBLIC_`.

```bash
# .env / .env.local
NEXT_PUBLIC_PROJECT_ID=...
NEXT_PUBLIC_CLIENT_KEY=...
NEXT_PUBLIC_APP_ID=...
```

Never put an owner **private key** in client env or in the repo. Node smoke
tests may read `PRIVATE_KEY` from a local `.env` (gitignored); production
signing belongs to the user's wallet or a KMS/Vault, never a bundled key.

## The universal flow (memorize this)

```ts
const tx = await ua.createXxxTransaction({ /* ... */ }); // build
const signature = await SIGN(tx.rootHash);               // owner signs rootHash
const result = await ua.sendTransaction(tx, signature);  // broadcast
// result.transactionId -> https://universalx.app/activity/details?id=<id>
```

`SIGN` is the only part that changes per signer. See the matrix at the end.

---

## Recipe A: Node script (ethers Wallet)

Fastest smoke test. Not production-safe (loads a raw key).

```ts
import "dotenv/config";
import { Wallet, getBytes } from "ethers";
import {
  UniversalAccount,
  CHAIN_ID,
} from "@particle-network/universal-account-sdk";

const wallet = new Wallet(process.env.PRIVATE_KEY!);

const ua = new UniversalAccount({
  projectId: process.env.PROJECT_ID!,
  projectClientKey: process.env.CLIENT_KEY!,
  projectAppUuid: process.env.APP_ID!,
  ownerAddress: wallet.address,
  tradeConfig: { slippageBps: 100 },
});

// addresses
const opts = await ua.getSmartAccountOptions();
console.log("EVM UA:", opts.smartAccountAddress);
console.log("SOL UA:", opts.solanaSmartAccountAddress);

// unified balance
const assets = await ua.getPrimaryAssets();
console.log("Balance USD:", assets.totalAmountInUSD);

// transfer
const tx = await ua.createTransferTransaction({
  token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0x0000000000000000000000000000000000000000" },
  amount: "0.001",
  receiver: "0xRecipient...",
});
const signature = await wallet.signMessage(getBytes(tx.rootHash)); // NOTE getBytes
const result = await ua.sendTransaction(tx, signature);
console.log(`https://universalx.app/activity/details?id=${result.transactionId}`);
```

---

## Recipe B: Next.js + Particle Auth (social login)

Recommended for consumer apps. `@particle-network/authkit` gives social login
and an EOA; UA wraps it.

```tsx
"use client";
import { useEthereum } from "@particle-network/authkit";
import {
  UniversalAccount,
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
} from "@particle-network/universal-account-sdk";
import { Interface, parseEther, toBeHex } from "ethers";
import { useEffect, useMemo, useState } from "react";

export function useUniversalAccount() {
  const { address, provider } = useEthereum(); // address = owner EOA
  const [ua, setUa] = useState<UniversalAccount | null>(null);
  const [evmAddress, setEvmAddress] = useState<string>();
  const [balanceUSD, setBalanceUSD] = useState<number>();

  useEffect(() => {
    if (!address) return;
    const instance = new UniversalAccount({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
      projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
      projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
      ownerAddress: address,
      tradeConfig: { slippageBps: 100, universalGas: true },
    });
    setUa(instance);
  }, [address]);

  useEffect(() => {
    if (!ua) return;
    ua.getSmartAccountOptions().then((o) => setEvmAddress(o.smartAccountAddress!));
    ua.getPrimaryAssets().then((a) => setBalanceUSD(a.totalAmountInUSD));
  }, [ua]);

  const sendTransfer = async (to: string, amount: string) => {
    if (!ua) throw new Error("UA not ready");
    const tx = await ua.createTransferTransaction({
      token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0x0000000000000000000000000000000000000000" },
      amount,
      receiver: to,
    });
    const signature = await provider.signMessage(tx.rootHash); // Particle Auth: pass rootHash directly
    return ua.sendTransaction(tx, signature);
  };

  const callContract = async () => {
    if (!ua) throw new Error("UA not ready");
    const iface = new Interface(["function checkIn() public payable"]);
    const tx = await ua.createUniversalTransaction({
      chainId: CHAIN_ID.BASE_MAINNET,
      expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.ETH, amount: "0.0000001" }],
      transactions: [
        {
          to: "0x14dcD77D7C9DA51b83c9F0383a995c40432a4578",
          data: iface.encodeFunctionData("checkIn"),
          value: toBeHex(parseEther("0.0000001")),
        },
      ],
    });
    const signature = await provider.signMessage(tx.rootHash);
    return ua.sendTransaction(tx, signature);
  };

  return { ua, evmAddress, balanceUSD, sendTransfer, callContract };
}
```

Wrap the app in the AuthKit provider (see AuthKit docs) so `useEthereum()`
resolves. UA is created only after `address` exists (post-login).

---

## Recipe C: Injected browser wallet (MetaMask / EIP-1193)

Standard JSON-RPC wallet as owner. This is Smart Account (4337) mode; JSON-RPC
wallets cannot do 7702 (see particle-ua-7702-mode).

```ts
import { ethers } from "ethers";
import {
  UniversalAccount,
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
} from "@particle-network/universal-account-sdk";

if (!window.ethereum) throw new Error("No injected wallet");

const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();
const address = await signer.getAddress();

const ua = new UniversalAccount({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
  ownerAddress: address,
  tradeConfig: { slippageBps: 100 },
});

const tx = await ua.createUniversalTransaction({
  chainId: CHAIN_ID.AVALANCHE_MAINNET,
  expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.USDT, amount: "1" }],
  transactions: [],
});
const signature = await signer.signMessage(tx.rootHash); // BrowserProvider: pass rootHash directly
const result = await ua.sendTransaction(tx, signature);
```

---

## Recipe D: Particle Connect (viem walletClient)

`@particle-network/connectkit` provides a wallet-connection UI; the connected
wallet's viem `walletClient` signs.

```tsx
"use client";
import { useWallets, useAccount } from "@particle-network/connectkit";
import {
  UniversalAccount,
  CHAIN_ID,
} from "@particle-network/universal-account-sdk";

const [primaryWallet] = useWallets();
const { address } = useAccount();
const walletClient = primaryWallet?.getWalletClient();

const ua = new UniversalAccount({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
  ownerAddress: address!,
  tradeConfig: { slippageBps: 100 },
});

const tx = await ua.createTransferTransaction({
  token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" },
  amount: "0.1",
  receiver: receiverAddress,
});
const signature = await walletClient?.signMessage({
  account: address as `0x${string}`,
  message: { raw: tx.rootHash }, // viem: wrap as { raw }
});
const result = await ua.sendTransaction(tx, signature);
```

---

## Signer matrix (the part that changes)

| Signer                         | Sign call                                                                 | Init source of owner address     |
| ------------------------------ | ------------------------------------------------------------------------- | -------------------------------- |
| ethers `Wallet` (Node)         | `wallet.signMessage(getBytes(tx.rootHash))`                               | `wallet.address`                 |
| ethers `BrowserProvider`       | `signer.signMessage(tx.rootHash)`                                         | `await signer.getAddress()`      |
| Particle Auth (`useEthereum`)  | `provider.signMessage(tx.rootHash)`                                       | `useEthereum().address`          |
| Particle Connect (viem)        | `walletClient.signMessage({ account, message: { raw: tx.rootHash } })`    | `useAccount().address`           |

Key gotcha: only the Node ethers `Wallet` path wraps `rootHash` in `getBytes()`;
browser ethers and Particle Auth pass the hex string directly; viem wraps it in
`{ raw }`. Mismatch produces an invalid-signature error at `sendTransaction`.

## Reading and displaying balance

```ts
const { assets, totalAmountInUSD } = await ua.getPrimaryAssets();
for (const a of assets) {
  console.log(a.tokenType, a.amount, a.amountInUSD);
  for (const c of a.chainAggregation) {
    console.log("  chain", c.token.chainId, c.amount, c.amountInUSD);
  }
}
```

For a balance-breakdown widget see the how-to:
https://developers.particle.network/universal-accounts/how-to/balances

## Gotchas

- Create the UA instance only after you have the owner address (post-connect /
  post-login), else `ownerAddress` is undefined.
- `amount` values are human-readable strings ("0.1"), not base units.
- Native asset address is `0x0000000000000000000000000000000000000000`.
- `expectTokens` describes what the action needs on the destination; the SDK
  sources and bridges it from primary assets. `transactions: []` is valid when
  you only need funds moved.
- Show progress: bridging + settlement can take longer than a single-chain tx.
  Poll/display via `result.transactionId` and the activity link.

## Source docs

- Web quickstart: https://developers.particle.network/universal-accounts/web-quickstart
- Reference impl (Next.js + Particle Auth): https://developers.particle.network/universal-accounts/reference-implementation
- Browser wallet how-to: https://developers.particle.network/universal-accounts/how-to/provider
- Particle Connect: https://developers.particle.network/universal-accounts/ua-reference/web/particle-connect
- Mini course: https://developers.particle.network/universal-accounts/ua-course/intro
