import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";

const AuthGuard = () => {
  const { currentUser, isLoading } = useAuthStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-dvh">
        <div className="text-xl font-medium text-indigo-600 animate-pulse">
          Verificando sesión...
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default AuthGuard;
