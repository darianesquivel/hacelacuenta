import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "../layout/AuthGuard";
import RootLayout from "../layout/RootLayout";
import Home from "../pages/Home";
import LoginPageV2 from "../pages/LoginPageV2";
import EventDetailRouteWrapper from "../components/EventDetailRouteWrapper";
import ErrorBoundary from "../components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPageV2 />,
      },
      {
        path: "/events/:id",
        element: (
          <ErrorBoundary>
            <EventDetailRouteWrapper />
          </ErrorBoundary>
        ),
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/",
            element: (
              <ErrorBoundary>
                <Home />
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
]);
