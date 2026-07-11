---
name: particle-ua-server
description: >
  Server-side / backend usage of Particle Network Universal Accounts: Node
  signing with an ethers Wallet (signMessageSync), reading transaction history
  (getTransactions / getTokenTransactions / getTransaction), and the low-level
  REST API for non-JS backends. Use for cron jobs, agents, API routes, or any
  server that builds and sends UA transactions. For app/client wiring use
  particle-ua-web-integration.
---

# Particle Universal Accounts: Server-side

Same SDK, running in Node. The difference is who holds the signing key: on a
server it is your own key, so treat it as custody of user funds.

## Backend init + sign

Init is the same. Node can sign synchronously with `signMessageSync` over the
`getBytes(rootHash)`.

```ts
import { UniversalAccount, CHAIN_ID } from "@particle-network/universal-account-sdk";
import { Wallet, getBytes } from "ethers";

const wallet = new Wallet(process.env.PRIVATE_KEY!); // key or mnemonic

const ua = new UniversalAccount({
  projectId: process.env.PROJECT_ID!,
  projectClientKey: process.env.CLIENT_KEY!,
  projectAppUuid: process.env.APP_ID!,
  ownerAddress: wallet.address,
  tradeConfig: { slippageBps: 100, universalGas: true },
});

const tx = await ua.createBuyTransaction({
  token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0x912CE59144191C1204E64559FE8253a0e49E6548" },
  amountInUSD: "0.1",
});

const signature = wallet.signMessageSync(getBytes(tx.rootHash)); // sync, Node
const result = await ua.sendTransaction(tx, signature);
console.log("tx id:", result.transactionId);
```

Note: some minimal docs examples omit `projectClientKey` / `projectAppUuid`;
include all three credentials from the dashboard to be safe.

## Key management (security)

- Never bundle a private key in client code or commit it (rules section 1). The
  pre-commit hook blocks `.env*` and key files.
- A local `.env` with `PRIVATE_KEY` is fine for a smoke test only.
- Production: hold the signer in a KMS / HashiCorp Vault and sign there. The
  docs do not ship a KMS example; the integration point is the `signMessage`
  step over `getBytes(tx.rootHash)`, so any signer that can sign raw bytes for
  the owner address works. Whoever holds this key can move the account's funds.

## Transaction history

```ts
// all transactions, paginated (page, pageSize)
const page1 = await ua.getTransactions(1, 20);

// filter by token + chain
const tokenTxs = await ua.getTokenTransactions({
  chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
  address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
});

// next page via nextPageToken
const tokenTxs2 = await ua.getTokenTransactions(
  { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: "0x912CE59144191C1204E64559FE8253a0e49E6548" },
  tokenTxs.nextPageToken,
);

// single transaction detail
const detail = await ua.getTransaction(result.transactionId); // TransactionDetails
```

`getTransactions(page, pageSize)` returns newest-first, up to `pageSize` items.
`getTokenTransactions` and `getTransactions` responses include `nextPageToken`
when more results exist. `getTransaction(id)` returns a `TransactionDetails`.

## REST API (low-level, non-JS backends)

The Universal Accounts REST API gives "direct, low-level access to Particle
Network's Chain Abstraction infrastructure" for custom or non-JavaScript
backends. Exact endpoints, payloads, and auth headers are not reproduced in the
markdown doc (the page is a pointer). Before using it, pull the current spec:

- API page: https://developers.particle.network/universal-accounts/ua-reference/apis/ua
- LLM index (discover all pages): https://developers.particle.network/llms.txt

Prefer the JS SDK when your backend is Node; drop to REST only for other
languages or low-level control.

## Source docs

- Backend usage: https://developers.particle.network/universal-accounts/ua-reference/web/backend
- History: https://developers.particle.network/universal-accounts/ua-reference/web/history
- REST API: https://developers.particle.network/universal-accounts/ua-reference/apis/ua
