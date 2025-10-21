import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeAppearance = "light" | "dark";

interface ThemeState {
  currentTheme: ThemeAppearance;
  toggleTheme: () => void;
  setTheme: (theme: ThemeAppearance) => void;
}

export const useThemeStore = create(
  persist<ThemeState>(
    (set) => ({
      currentTheme: "dark",
      toggleTheme: () =>
        set((state) => ({
          currentTheme: state.currentTheme === "dark" ? "light" : "dark",
        })),

      setTheme: (theme) => set({ currentTheme: theme }),
    }),
    {
      name: "app-theme-storage",
    }
  )
);
