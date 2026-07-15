"use client";

import { useEffect } from "react";
import { type AccountKeys, useAccountStore } from "@/stores/account";
import { useSavedStore } from "@/stores/saved";
import { useThemeStore } from "@/stores/theme";

// Client-only store setup. Rehydrates persisted stores and configures the
// account store with server-injected keys after mount, so the first paint
// matches the server.
export function StoreInitializer({ keys }: { keys: AccountKeys }) {
  useEffect(() => {
    useSavedStore.persist.rehydrate();
    useThemeStore.getState().init();
    useAccountStore.getState().configure(keys);
  }, [keys]);
  return null;
}
