import { create } from "zustand";

const KEY = "maroon:theme";

function apply(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(KEY, dark ? "dark" : "light");
  } catch {
    // ignore storage errors
  }
}

interface ThemeState {
  dark: boolean;
  toggle: () => void;
  init: () => void;
}

// The `dark` class is set pre-paint by an inline script in the root layout to
// avoid a flash; `init` just reads it back so the toggle reflects reality.
export const useThemeStore = create<ThemeState>((set, get) => ({
  dark: false,
  toggle: () => {
    const next = !get().dark;
    apply(next);
    set({ dark: next });
  },
  init: () => {
    if (typeof document === "undefined") return;
    set({ dark: document.documentElement.classList.contains("dark") });
  },
}));
