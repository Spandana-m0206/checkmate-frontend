import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import PublicRoute from "./component/layout/PublicRoute";
import ProtectedRoute from "./component/layout/ProtectedRoute";
import AppLayout from "./component/layout/AppLayout";
import AuthPage from "./feature/auth";
import HomePage from "./feature/home";
import GamePage from "./feature/game";
import { HistoryDetailPage } from "./feature/history";
import ProfilePage from "./feature/profile";
import Spinner from "./component/ui/Spinner";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { useAuthStore } from "./store/useAuthStore";

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <AuthPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/game/:gameId", element: <GamePage /> },
          // Game history lives on the profile page; the old list route is
          // kept as a redirect so existing links still resolve.
          { path: "/history", element: <Navigate to="/profile" replace /> },
          { path: "/history/:gameId", element: <HistoryDetailPage /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth" replace />,
  },
]);

export default function App() {
  const status = useAuthStore((s) => s.status);

  useAuthBootstrap();

  // Hold the router back until the persisted session resolves, so the guards
  // never see a half-restored session and bounce the user to /auth.
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Spinner size="lg" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
