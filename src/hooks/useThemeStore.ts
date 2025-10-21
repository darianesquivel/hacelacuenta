import { useThemeStore } from "../store/themeStore";

export const useThemeStatus = () => {
  const { currentTheme } = useThemeStore();
  return {
    currentTheme,
  };
};
