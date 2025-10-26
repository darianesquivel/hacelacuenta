import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthGuard from "../layout/AuthGuard";
import LoginPage from "../pages/LoginPage";
import EventDetailRouteWrapper from "../components/EventDetailRouteWrapper";
import EventsList from "../components/EventsList";
import ErrorBoundary from "../components/ErrorBoundary";
import Layout from "../layout/Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
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
                <EventsList />
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
]);
