import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import PublicRoute from "./component/layout/PublicRoute";
import ProtectedRoute from "./component/layout/ProtectedRoute";
import AppLayout from "./component/layout/AppLayout";
import AuthPage from "./feature/auth";
import HomePage from "./feature/home";
import GamePage from "./feature/game";
import { HistoryPage, HistoryDetailPage } from "./feature/history";
import ProfilePage from "./feature/profile";

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
          { path: "/history", element: <HistoryPage /> },
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
  return <RouterProvider router={router} />;
}
