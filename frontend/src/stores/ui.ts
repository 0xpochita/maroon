import { create } from "zustand";
import type { Vault } from "@/types/earn";

type AuthMode = "login" | "signup";

interface UiState {
  authMode: AuthMode | null; // null = closed
  depositOpen: boolean;
  earnVault: Vault | null; // null = closed
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  openDeposit: () => void;
  closeDeposit: () => void;
  openEarn: (vault: Vault) => void;
  closeEarn: () => void;
}

// Global UI state for modals that are triggered from many places (auth, deposit,
// earn). Rendered once by <GlobalModals/>.
export const useUiStore = create<UiState>((set) => ({
  authMode: null,
  depositOpen: false,
  earnVault: null,
  openAuth: (mode = "login") => set({ authMode: mode }),
  closeAuth: () => set({ authMode: null }),
  openDeposit: () => set({ depositOpen: true }),
  closeDeposit: () => set({ depositOpen: false }),
  openEarn: (vault) => set({ earnVault: vault }),
  closeEarn: () => set({ earnVault: null }),
}));
