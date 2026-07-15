import { ethers } from "ethers";
import { create } from "zustand";
import { getMagic } from "@/lib/magic";
import { depositToVault, depositUsdc, newUniversalAccount } from "@/lib/ua";
import type { Vault } from "@/types/earn";

export type AccountStatus = "disconnected" | "connecting" | "ready";

export interface Asset {
  tokenType: string;
  amount: number;
  amountInUSD: number;
}

export interface DepositResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface AccountKeys {
  magicApiKey?: string;
  projectId?: string;
  clientKey?: string;
  appId?: string;
}

const MOCK_ADDRESS = "0x3f4C2b1a9E8d7654321098765432109876fEa1b2";
const MOCK_ASSETS: Asset[] = [
  { tokenType: "USDC", amount: 1284.52, amountInUSD: 1284.52 },
];

// biome-ignore lint/suspicious/noExplicitAny: SDK asset shape is untyped here
function toAssets(raw: any): Asset[] {
  const list = raw?.assets ?? [];
  // biome-ignore lint/suspicious/noExplicitAny: per-item shape is untyped
  return list.map((a: any) => ({
    tokenType: String(a.tokenType ?? a.token ?? "").toUpperCase(),
    amount: Number(a.amount ?? 0),
    amountInUSD: Number(a.amountInUSD ?? 0),
  }));
}

interface AccountState {
  keys: AccountKeys;
  configured: boolean;
  mock: boolean;
  status: AccountStatus;
  address?: string;
  balanceUsd?: number;
  assets: Asset[];
  configure: (keys: AccountKeys) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  openOnramp: () => void;
  deposit: (vault: Vault, amountUsd: number) => Promise<DepositResult>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  keys: {},
  configured: false,
  mock: true,
  status: "disconnected",
  assets: [],

  configure: async (keys) => {
    const mock = !(
      keys.magicApiKey &&
      keys.projectId &&
      keys.clientKey &&
      keys.appId
    );
    set({ keys, configured: true, mock });
    if (mock) return;
    const magic = getMagic(keys.magicApiKey ?? "");
    if (magic && (await magic.user.isLoggedIn())) {
      await get().refresh();
    }
  },

  refresh: async () => {
    const { keys, mock } = get();
    if (mock) return;
    const magic = getMagic(keys.magicApiKey ?? "");
    if (!magic) return;
    set({ status: "connecting" });
    try {
      const provider = new ethers.BrowserProvider(magic.rpcProvider);
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();

      // EIP-7702 mode: the Magic EOA is upgraded in place to a Universal Account.
      const ua = newUniversalAccount(owner, {
        projectId: keys.projectId ?? "",
        clientKey: keys.clientKey ?? "",
        appId: keys.appId ?? "",
      });

      const opts = await ua.getSmartAccountOptions();
      set({ address: opts.smartAccountAddress ?? owner });
      try {
        const primary = await ua.getPrimaryAssets();
        set({
          balanceUsd: Number(primary?.totalAmountInUSD ?? 0),
          assets: toAssets(primary),
        });
      } catch (error) {
        console.error("balance read failed", error);
      }
      set({ status: "ready" });
    } catch (error) {
      console.error("account load failed", error);
      set({ status: "disconnected" });
    }
  },

  loginWithEmail: async (email) => {
    const { keys, mock, refresh } = get();
    if (mock) {
      set({
        status: "ready",
        address: MOCK_ADDRESS,
        balanceUsd: 1284.52,
        assets: MOCK_ASSETS,
      });
      return;
    }
    const magic = getMagic(keys.magicApiKey ?? "");
    if (!magic) return;
    set({ status: "connecting" });
    try {
      await magic.auth.loginWithEmailOTP({ email, showUI: true });
      await refresh();
    } catch (error) {
      console.error("login failed", error);
      set({ status: "disconnected" });
    }
  },

  logout: async () => {
    const { keys, mock } = get();
    if (!mock) {
      const magic = getMagic(keys.magicApiKey ?? "");
      await magic?.user.logout();
    }
    set({
      status: "disconnected",
      address: undefined,
      balanceUsd: undefined,
      assets: [],
    });
  },

  openOnramp: () => {
    const { keys, mock } = get();
    if (mock) return;
    try {
      // biome-ignore lint/suspicious/noExplicitAny: showUI exists on the wallet module
      (getMagic(keys.magicApiKey ?? "")?.wallet as any)?.showUI?.();
    } catch (error) {
      console.error("onramp failed", error);
    }
  },

  deposit: async (vault, amountUsd) => {
    const { keys, mock, refresh } = get();
    if (mock) return { ok: true, id: "mock" };
    const magic = getMagic(keys.magicApiKey ?? "");
    if (!magic) return { ok: false, error: "Wallet not ready" };
    try {
      const k = {
        projectId: keys.projectId ?? "",
        clientKey: keys.clientKey ?? "",
        appId: keys.appId ?? "",
      };
      const id =
        vault.vaultAddress && vault.chainId
          ? await depositToVault({ magic, keys: k, vault, amountUsd })
          : await depositUsdc({
              magic,
              keys: k,
              chainName: vault.chain,
              amount: String(amountUsd),
            });
      await refresh();
      return { ok: true, id };
    } catch (error) {
      console.error("deposit failed", error);
      return {
        ok: false,
        error: (error as Error)?.message ?? "Deposit failed",
      };
    }
  },
}));
