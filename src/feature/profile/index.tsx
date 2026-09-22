import { useNavigate } from "react-router";
import ProfileCard from "./component/ProfileCard";
import Button from "../../component/ui/Button";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate("/auth", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-sm p-4">
      <div className="rounded-xl bg-white p-6 dark:bg-gray-800">
        <ProfileCard user={user} />

        <div className="mt-6">
          <Button variant="danger" onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
