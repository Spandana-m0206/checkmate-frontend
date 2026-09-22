import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export default function PublicRoute() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
