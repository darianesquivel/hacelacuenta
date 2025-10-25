import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { Sun, Moon, LogOut } from "lucide-react";
import { Button, Avatar, Flex, Text } from "@radix-ui/themes";
import { useToast } from "../hooks/useToast";

const NavHeader = () => {
  const { currentUser, signOut } = useAuthStore();
  const { currentTheme, toggleTheme } = useThemeStore();
  const { showSuccess, showError } = useToast();

  const photoURL =
    currentUser?.photoURL || "https://placehold.co/40x40/cccccc/ffffff?text=U";
  const displayName =
    currentUser?.displayName || currentUser?.email || "Usuario";

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showError("Error al cerrar sesión");
    }
  };

  return (
    <header className="shadow-md p-4 flex justify-between items-center sticky top-0 z-10 ">
      <img src="/logo.png" alt="HacelaCuenta" width={100} />

      <Flex align="center" gap="4">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          size="3"
        >
          {currentTheme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </Button>

        {currentUser && (
          <Flex align="center" gap="4">
            <Flex align="center" gap="2" className="hidden sm:flex">
              <Avatar
                fallback="U"
                src={photoURL}
                alt={displayName}
                size="3"
                radius="full"
              />
              <Text className="text-gray-700 dark:text-gray-300 font-medium">
                {displayName.split(" ")[0]}
              </Text>
            </Flex>
            <Button color="red" variant="soft" onClick={handleSignOut} size="3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </Flex>
        )}
      </Flex>
    </header>
  );
};

export default NavHeader;
