import { Button } from "@radix-ui/themes";
import { useThemeStore } from "../store/themeStore";
import { Sun, Moon } from "lucide-react";

const ThemeButton = () => {
  const { currentTheme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="surface"
      color="gray"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      size="3"
    >
      {currentTheme === "dark" ? (
        <Moon className="h-5 w-5 fill-lime-50" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      )}
    </Button>
  );
};

export default ThemeButton;
