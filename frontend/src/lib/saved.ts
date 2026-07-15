"use client";

import { useEffect, useState } from "react";

export interface SavedVault {
  id: string;
  name?: string;
  protocol: string;
  chain: string;
  apy: number;
  logo: string;
}

const KEY = "maroon:saved";
const EVENT = "maroon:saved-changed";

function read(): SavedVault[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function toggleSaved(vault: SavedVault) {
  const list = read();
  const exists = list.some((v) => v.id === vault.id);
  const next = exists
    ? list.filter((v) => v.id !== vault.id)
    : [vault, ...list];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

// Reactive saved vaults, synced across components via a window event. Stores a
// lightweight snapshot so the saved list renders without re-fetching.
export function useSaved() {
  const [items, setItems] = useState<SavedVault[]>([]);
  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return {
    items,
    ids: items.map((v) => v.id),
    has: (id: string) => items.some((v) => v.id === id),
    toggle: toggleSaved,
  };
}
