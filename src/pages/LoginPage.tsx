import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import { Button, Card, Text, Heading, Callout } from "@radix-ui/themes";
import { Spinner } from "@radix-ui/themes";

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
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <Heading size="8" weight="bold" className="mb-4">
                HacelaCuenta
              </Heading>
              <Text size="4" className="text-white/90 leading-relaxed">
                La forma más fácil de dividir gastos entre amigos, familia y
                compañeros de trabajo.
              </Text>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <Text size="3" className="text-white/90">
                  Divide gastos automáticamente
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <Text size="3" className="text-white/90">
                  Sugerencias de pagos inteligentes
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <Text size="3" className="text-white/90">
                  Seguimiento en tiempo real
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <Heading size="6" weight="bold" className="text-gray-900 mb-2">
              ¡Bienvenido!
            </Heading>
            <Text size="3" color="gray" className="mb-8">
              Inicia sesión para comenzar a dividir tus gastos
            </Text>
          </div>

          <Card className="p-6 shadow-lg border-0">
            {error && (
              <Callout.Root color="red" size="1" className="mb-4">
                <Callout.Text>{error}</Callout.Text>
              </Callout.Root>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              size="3"
              className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 font-medium"
              style={{
                background: "white",
                border: "1px solid #d1d5db",
                color: "#374151",
              }}
            >
              {isLoading ? (
                <Spinner size="2" />
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center">
              <Text size="2" color="gray">
                Al continuar, aceptas nuestros términos de servicio
              </Text>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Text size="2" color="gray">
              ¿Nuevo en HacelaCuenta?{" "}
              <span className="text-indigo-600 font-medium">
                ¡Es gratis y fácil de usar!
              </span>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
