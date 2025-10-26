import { useAuthStore } from "@/store/authStore";
import { Button } from "@radix-ui/themes";
import { LogOut } from "lucide-react";

const LogOutButton = () => {
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Button color="red" variant="soft" onClick={handleSignOut} size="3">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Salir</span>
    </Button>
  );
};

export default LogOutButton;
