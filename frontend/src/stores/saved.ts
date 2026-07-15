import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SavedVault {
  id: string;
  name?: string;
  protocol: string;
  chain: string;
  apy: number;
  logo: string;
}

interface SavedState {
  items: SavedVault[];
  toggle: (vault: SavedVault) => void;
  has: (id: string) => boolean;
}

// Persisted saved vaults. `skipHydration` avoids a server/client mismatch;
// StoreInitializer calls `useSavedStore.persist.rehydrate()` after mount.
export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (vault) =>
        set((state) => ({
          items: state.items.some((v) => v.id === vault.id)
            ? state.items.filter((v) => v.id !== vault.id)
            : [vault, ...state.items],
        })),
      has: (id) => get().items.some((v) => v.id === id),
    }),
    {
      name: "maroon:saved",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
