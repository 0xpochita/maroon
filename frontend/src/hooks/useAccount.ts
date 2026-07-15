"use client";

import { createContext, useContext } from "react";
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

export interface AccountState {
  status: AccountStatus;
  address?: string;
  balanceUsd?: number;
  assets: Asset[];
  promptLogin: () => void;
  logout: () => void;
  openDeposit: () => void;
  openOnramp: () => void;
  refresh: () => void;
  deposit: (vault: Vault, amountUsd: number) => Promise<DepositResult>;
}

export const AccountContext = createContext<AccountState | null>(null);

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount must be used inside <Providers>");
  }
  return ctx;
}
