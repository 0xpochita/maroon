import {
  CHAIN_ID,
  UNIVERSAL_ACCOUNT_VERSION,
  UniversalAccount,
} from "@particle-network/universal-account-sdk";
import { ethers, Signature } from "ethers";

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

// Moves USDC into `chainName` via the Universal Account. If the unified balance
// sits on another chain the SDK sources and bridges it, so this is a real
// cross-chain operation. First transaction per chain also runs the EIP-7702
// delegation: each userOp that carries an eip7702Auth is signed by the Magic
// embedded wallet (magic.wallet.sign7702Authorization) and passed to
// sendTransaction as the authorization list.
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
  const provider = new ethers.BrowserProvider(magic.rpcProvider);
  const signer = await provider.getSigner();
  const owner = await signer.getAddress();
  const ua = newUniversalAccount(owner, keys);

  const tx = await ua.createTransferTransaction({
    token: { chainId: CHAIN[chainName], address: USDC[chainName] },
    amount,
    receiver: owner,
  });

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
