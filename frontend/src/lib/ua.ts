import {
  CHAIN_ID,
  type SUPPORTED_TOKEN_TYPE,
  UNIVERSAL_ACCOUNT_VERSION,
  UniversalAccount,
} from "@particle-network/universal-account-sdk";
import { ethers, Signature } from "ethers";
import type { Vault } from "@/types/earn";
import { payToken } from "./pay-tokens";
import { isUaChain } from "./ua-chains";

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
    // Gas + fees are paid from the unified balance by default (chain
    // abstraction). Higher slippage (3%) avoids simulation reverts on the
    // swap+deposit zap, especially for small amounts / thinner routes.
    tradeConfig: { slippageBps: 300 },
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
  fromToken,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Magic instance is untyped here
  magic: any;
  keys: ParticleKeys;
  vault: Vault;
  amountUsd: number;
  // Source token symbol (USDC/USDT/ETH). LI.FI converts to the vault asset.
  fromToken?: string;
}): Promise<string> {
  if (!vault.chainId || !vault.vaultAddress) {
    throw new Error("Vault is not depositable");
  }
  if (!isUaChain(vault.chainId)) {
    throw new Error(
      `Deposit isn't supported on ${vault.chain} yet. Universal Accounts covers Ethereum, Base, Arbitrum and BNB Chain.`,
    );
  }
  const { signer, owner } = await signerFor(magic);

  // Amount is denominated in the source token; use its decimals. `fromChainId`
  // tells the quote which chain to source from (BNB/SOL live on their own chain).
  const pt = payToken(fromToken);
  const amountBase = BigInt(
    Math.round(amountUsd * 10 ** pt.decimals),
  ).toString();
  const res = await fetch("/api/lifi/quote", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chainId: vault.chainId,
      vaultAddress: vault.vaultAddress,
      tokenAddress: vault.tokenAddress,
      fromAddress: owner,
      amount: amountBase,
      fromToken,
      fromChainId: pt.nativeChainId,
    }),
  });
  const quote = await res.json();
  const txRequest = quote?.transactionRequest;
  if (!txRequest) throw new Error(quote?.error ?? "No deposit route found");

  // Prepend an ERC20 approval for the LI.FI router (skip for native tokens) so
  // the router's transferFrom doesn't revert during simulation.
  const NATIVE = "0x0000000000000000000000000000000000000000";
  const transactions: { to: string; data: string; value: string }[] = [];
  if (
    quote.approvalAddress &&
    quote.fromTokenAddress &&
    quote.fromTokenAddress.toLowerCase() !== NATIVE
  ) {
    const approveData = new ethers.Interface([
      "function approve(address spender, uint256 amount)",
    ]).encodeFunctionData("approve", [quote.approvalAddress, quote.fromAmount]);
    transactions.push({
      to: quote.fromTokenAddress,
      data: approveData,
      value: "0x0",
    });
  }
  transactions.push({
    to: txRequest.to,
    data: txRequest.data,
    value: txRequest.value ?? "0x0",
  });

  const ua = newUniversalAccount(owner, keys);
  const tx = await ua.createUniversalTransaction({
    chainId: vault.chainId,
    // expectTokens = the source token the UA should pull from the unified
    // balance (by TYPE, not address) plus its human amount.
    expectTokens: [
      {
        type: (fromToken ?? "USDC").toLowerCase() as SUPPORTED_TOKEN_TYPE,
        amount: String(amountUsd),
      },
    ],
    transactions,
  });
  return finalize(ua, magic, signer, tx);
}
