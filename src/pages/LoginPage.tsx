import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

const LoginPage = () => {
  const { signIn, isLoading, error, currentUser } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signIn();
    } catch (e) {
      console.error("Login fallido:", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-8 shadow-lg rounded-xl text-center">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">
          HacelaCuenta
        </h1>
        <p className="mb-8 text-gray-600">
          Inicia sesión para dividir tus gastos fácilmente.
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⚙️</span> Conectando...
            </>
          ) : (
            "Iniciar sesión con Google"
          )}
        </button>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
