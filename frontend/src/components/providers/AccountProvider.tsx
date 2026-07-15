"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import {
  AccountContext,
  type AccountStatus,
  type Asset,
} from "@/hooks/useAccount";
import { getMagic } from "@/lib/magic";
import { depositToVault, depositUsdc, newUniversalAccount } from "@/lib/ua";
import type { Vault } from "@/types/earn";
import { AuthModal } from "../(main)/AuthModal";
import { DepositModal } from "../(main)/DepositModal";

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

export function MagicAccountProvider({
  magicApiKey,
  projectId,
  clientKey,
  appId,
  children,
}: {
  magicApiKey: string;
  projectId: string;
  clientKey: string;
  appId: string;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AccountStatus>("disconnected");
  const [address, setAddress] = useState<string>();
  const [balanceUsd, setBalanceUsd] = useState<number>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const loadAccount = useCallback(async () => {
    const magic = getMagic(magicApiKey);
    if (!magic) return;
    setStatus("connecting");
    try {
      const provider = new ethers.BrowserProvider(magic.rpcProvider);
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();

      // EIP-7702 mode: the Magic EOA is upgraded in place to a Universal Account.
      const ua = newUniversalAccount(owner, { projectId, clientKey, appId });

      const opts = await ua.getSmartAccountOptions();
      setAddress(opts.smartAccountAddress ?? owner);
      try {
        const primary = await ua.getPrimaryAssets();
        setBalanceUsd(Number(primary?.totalAmountInUSD ?? 0));
        setAssets(toAssets(primary));
      } catch (error) {
        console.error("balance read failed", error);
      }
      setStatus("ready");
    } catch (error) {
      console.error("account load failed", error);
      setStatus("disconnected");
    }
  }, [magicApiKey, projectId, clientKey, appId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const magic = getMagic(magicApiKey);
      if (magic && (await magic.user.isLoggedIn()) && !cancelled) {
        loadAccount();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [magicApiKey, loadAccount]);

  const promptLogin = useCallback(() => setAuthOpen(true), []);
  const openDeposit = useCallback(() => setDepositOpen(true), []);
  const refresh = useCallback(() => {
    loadAccount();
  }, [loadAccount]);

  const openOnramp = useCallback(() => {
    const magic = getMagic(magicApiKey);
    try {
      // biome-ignore lint/suspicious/noExplicitAny: showUI exists on the wallet module
      (magic?.wallet as any)?.showUI?.();
    } catch (error) {
      console.error("onramp failed", error);
    }
  }, [magicApiKey]);

  const deposit = useCallback(
    async (vault: Vault, amountUsd: number) => {
      const magic = getMagic(magicApiKey);
      if (!magic) return { ok: false, error: "Wallet not ready" };
      try {
        const keys = { projectId, clientKey, appId };
        const id =
          vault.vaultAddress && vault.chainId
            ? await depositToVault({ magic, keys, vault, amountUsd })
            : await depositUsdc({
                magic,
                keys,
                chainName: vault.chain,
                amount: String(amountUsd),
              });
        refresh();
        return { ok: true, id };
      } catch (error) {
        console.error("deposit failed", error);
        return {
          ok: false,
          error: (error as Error)?.message ?? "Deposit failed",
        };
      }
    },
    [magicApiKey, projectId, clientKey, appId, refresh],
  );

  const handleEmail = useCallback(
    async (email: string) => {
      const magic = getMagic(magicApiKey);
      if (!magic) return;
      setStatus("connecting");
      try {
        await magic.auth.loginWithEmailOTP({ email, showUI: true });
        setAuthOpen(false);
        await loadAccount();
      } catch (error) {
        console.error("login failed", error);
        setStatus("disconnected");
      }
    },
    [magicApiKey, loadAccount],
  );

  const logout = useCallback(async () => {
    const magic = getMagic(magicApiKey);
    await magic?.user.logout();
    setStatus("disconnected");
    setAddress(undefined);
    setBalanceUsd(undefined);
    setAssets([]);
  }, [magicApiKey]);

  return (
    <AccountContext.Provider
      value={{
        status,
        address,
        balanceUsd,
        assets,
        promptLogin,
        logout,
        openDeposit,
        openOnramp,
        refresh,
        deposit,
      }}
    >
      {children}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onEmail={handleEmail}
        busy={status === "connecting"}
      />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
    </AccountContext.Provider>
  );
}

// Mock account for local dev without Magic/Particle keys.
const MOCK_ADDRESS = "0x3f4C2b1a9E8d7654321098765432109876fEa1b2";
const MOCK_ASSETS: Asset[] = [
  { tokenType: "USDC", amount: 1284.52, amountInUSD: 1284.52 },
];

export function MockAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AccountStatus>("disconnected");
  const [authOpen, setAuthOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const promptLogin = useCallback(() => setAuthOpen(true), []);
  const handleEmail = useCallback(() => {
    setAuthOpen(false);
    setStatus("ready");
  }, []);
  const logout = useCallback(() => setStatus("disconnected"), []);
  const ready = status === "ready";

  return (
    <AccountContext.Provider
      value={{
        status,
        address: ready ? MOCK_ADDRESS : undefined,
        balanceUsd: ready ? 1284.52 : undefined,
        assets: ready ? MOCK_ASSETS : [],
        promptLogin,
        logout,
        openDeposit: () => setDepositOpen(true),
        openOnramp: () => {},
        refresh: () => {},
        deposit: async () => ({ ok: true, id: "mock" }),
      }}
    >
      {children}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onEmail={handleEmail}
      />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
    </AccountContext.Provider>
  );
}
