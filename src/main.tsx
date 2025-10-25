import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { router } from "./app/routes";
import { useThemeStatus } from "./hooks/useThemeStore";

const queryClient = new QueryClient();

function App() {
  const { currentTheme } = useThemeStatus();

  return (
    <QueryClientProvider client={queryClient}>
      <Theme appearance={currentTheme}>
        <RouterProvider router={router} />
      </Theme>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
