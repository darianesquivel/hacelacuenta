import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";
import LoadingState from "@/components/ui/LoadingState";

const AuthGuard = () => {
  const { currentUser, isLoading } = useAuthStatus();

  if (isLoading) {
    return <LoadingState message="Verificando sesión..." />;
  }

  if (currentUser) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default AuthGuard;
