import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "../layout/AuthGuard";
import RootLayout from "../layout/RootLayout";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import EventDetailRouteWrapper from "../components/EventDetailRouteWrapper";

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
        path: "/events/:id",
        element: <EventDetailRouteWrapper />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
        ],
      },
    ],
  },
]);
