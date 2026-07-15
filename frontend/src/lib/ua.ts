import {
  CHAIN_ID,
  UNIVERSAL_ACCOUNT_VERSION,
  UniversalAccount,
} from "@particle-network/universal-account-sdk";
import { ethers, Signature } from "ethers";
import type { Vault } from "@/types/earn";

export interface ParticleKeys {
  projectId: string;
  clientKey: string;
  appId: string;
}

// Mainnet USDC per chain.
export const USDC: Record<string, string> = {
  Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  Arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  Ethereum: "0xA0b86991c6218b36c1D19D4a2e9Eb0cE3606eB48",
};

// ponytail: ETHEREUM_MAINNET name assumed from the SDK enum; verify against the
// installed SDK if Ethereum deposits fail (Base/Arbitrum are confirmed).
export const CHAIN: Record<string, number> = {
  Base: CHAIN_ID.BASE_MAINNET,
  Arbitrum: CHAIN_ID.ARBITRUM_MAINNET_ONE,
  Ethereum: CHAIN_ID.ETHEREUM_MAINNET,
};

export function newUniversalAccount(owner: string, keys: ParticleKeys) {
  return new UniversalAccount({
    projectId: keys.projectId,
    projectClientKey: keys.clientKey,
    projectAppUuid: keys.appId,
    ownerAddress: owner,
    smartAccountOptions: {
      useEIP7702: true,
      name: "UNIVERSAL",
      version: UNIVERSAL_ACCOUNT_VERSION,
      ownerAddress: owner,
    },
    tradeConfig: { slippageBps: 100, universalGas: true },
  });
}

// Signs the EIP-7702 authorization for each userOp that needs it (first tx per
// chain) with the Magic embedded wallet, then signs the tx rootHash and sends.
async function finalize(
  // biome-ignore lint/suspicious/noExplicitAny: SDK objects are untyped here
  ua: any,
  // biome-ignore lint/suspicious/noExplicitAny: Magic instance is untyped here
  magic: any,
  signer: ethers.Signer,
  // biome-ignore lint/suspicious/noExplicitAny: tx shape is untyped here
  tx: any,
): Promise<string> {
  const authorizations: { userOpHash: string; signature: string }[] = [];
  for (const userOp of tx.userOps ?? []) {
    const auth = userOp?.eip7702Auth;
    if (!auth) continue;
    const signed = await magic.wallet.sign7702Authorization({
      contractAddress: auth.address,
      chainId: auth.chainId,
      nonce: auth.nonce,
    });
    authorizations.push({
      userOpHash: userOp.userOpHash,
      signature: Signature.from({
        r: signed.r,
        s: signed.s,
        v: signed.v,
      }).serialized,
    });
  }

  const rootSignature = await signer.signMessage(tx.rootHash);
  const result = authorizations.length
    ? await ua.sendTransaction(tx, rootSignature, authorizations)
    : await ua.sendTransaction(tx, rootSignature);
  return result?.transactionId ?? "";
}

async function signerFor(
  // biome-ignore lint/suspicious/noExplicitAny: Magic instance is untyped here
  magic: any,
) {
  const provider = new ethers.BrowserProvider(magic.rpcProvider);
  const signer = await provider.getSigner();
  const owner = await signer.getAddress();
  return { signer, owner };
}

// Fallback deposit: moves USDC to the owner on `chainName` via the Universal
// Account. The SDK sources and bridges from the unified balance, so it is a real
// cross-chain operation. Used when a vault has no LI.FI address.
export async function depositUsdc({
  magic,
  keys,
  chainName,
  amount,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Magic instance is untyped here
  magic: any;
  keys: ParticleKeys;
  chainName: string;
  amount: string;
}): Promise<string> {
  const { signer, owner } = await signerFor(magic);
  const ua = newUniversalAccount(owner, keys);
  const tx = await ua.createTransferTransaction({
    token: { chainId: CHAIN[chainName], address: USDC[chainName] },
    amount,
    receiver: owner,
  });
  return finalize(ua, magic, signer, tx);
}

// Real vault deposit. LI.FI Composer builds the deposit calldata for the vault
// (fetched via our server route so the key stays server-side); the Universal
// Account executes it and sources the USDC cross-chain from the unified balance.
export async function depositToVault({
  magic,
  keys,
  vault,
  amountUsd,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Magic instance is untyped here
  magic: any;
  keys: ParticleKeys;
  vault: Vault;
  amountUsd: number;
}): Promise<string> {
  if (!vault.chainId || !vault.vaultAddress) {
    throw new Error("Vault is not depositable");
  }
  const { signer, owner } = await signerFor(magic);

  const amountBase = BigInt(Math.round(amountUsd * 1e6)).toString();
  const res = await fetch("/api/lifi/quote", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chainId: vault.chainId,
      vaultAddress: vault.vaultAddress,
      tokenAddress: vault.tokenAddress,
      fromAddress: owner,
      amount: amountBase,
    }),
  });
  const quote = await res.json();
  const txRequest = quote?.transactionRequest;
  if (!txRequest) throw new Error(quote?.error ?? "No deposit route found");

  const ua = newUniversalAccount(owner, keys);
  const tx = await ua.createUniversalTransaction({
    chainId: vault.chainId,
    expectTokens: [
      { tokenAddress: vault.tokenAddress, amount: String(amountUsd) },
    ],
    transactions: [
      {
        to: txRequest.to,
        data: txRequest.data,
        value: txRequest.value ?? "0x0",
      },
    ],
  });
  return finalize(ua, magic, signer, tx);
}
