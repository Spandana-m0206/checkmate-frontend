import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
