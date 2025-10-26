import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Avatar, Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { Sun, Moon, LogOut, User } from "lucide-react";

const UserCard = () => {
  const { currentUser } = useAuthStatus();
  const { signOut } = useAuthStore();
  const { currentTheme, toggleTheme } = useThemeStore();

  if (!currentUser) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Flex justify="center" align="center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="ghost" className="w-full justify-start p-2 h-auto">
            <Flex align="center" gap="3" className="w-full">
              <Avatar
                src={currentUser.photoURL || undefined}
                alt={currentUser.displayName || "Usuario"}
                size="2"
                fallback={<User className="h-4 w-4" />}
              />
              <Flex direction="column" align="start" className="flex-1 min-w-0">
                <Text size="2" weight="medium" className="truncate">
                  {currentUser.displayName || "Usuario"}
                </Text>
                <Text size="1" color="gray" className="truncate">
                  {currentUser.email}
                </Text>
              </Flex>
              <DropdownMenu.TriggerIcon />
            </Flex>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-56">
          <DropdownMenu.Item onClick={toggleTheme}>
            {currentTheme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <Text>Cambiar tema</Text>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <Text>Salir de la cuenta</Text>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
};

export default UserCard;
