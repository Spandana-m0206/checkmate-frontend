import { create } from "zustand";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

function getInitialTheme(): boolean {
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
}

const initialDark = getInitialTheme();
applyTheme(initialDark);

export const useThemeStore = create<ThemeState>((set) => ({
  dark: initialDark,

  toggle: () =>
    set((state) => {
      const next = !state.dark;
      applyTheme(next);
      return { dark: next };
    }),
}));
