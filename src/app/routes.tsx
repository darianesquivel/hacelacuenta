import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "../layout/AuthGuard";
import RootLayout from "../layout/RootLayout";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/events/:id",
            element: <>Grupo Detalle Placeholder</>,
          },
        ],
      },
    ],
  },
]);
