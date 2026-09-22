import { useNavigate } from "react-router";
import ProfileCard from "./component/ProfileCard";
import Button from "../../component/ui/Button";
import { GameHistoryPanel } from "../history";
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
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <div className="rounded-lg border border-edge bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ProfileCard user={user} />
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="shrink-0"
          >
            Log Out
          </Button>
        </div>
      </div>

      <GameHistoryPanel />
    </div>
  );
}
