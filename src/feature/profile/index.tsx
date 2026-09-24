import { useState } from "react";
import { useNavigate } from "react-router";
import ProfileCard from "./component/ProfileCard";
import EditProfileForm from "./component/EditProfileForm";
import Button from "../../component/ui/Button";
import { GameHistoryPanel } from "../history";
import { useAuthStore } from "../../store/useAuthStore";
import { logout } from "../auth/service";
import { clearProactiveRefresh } from "../../services/tokenManager";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [editOpen, setEditOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Even if the backend call fails, clear local state.
    }
    clearProactiveRefresh();
    clearAuth();
    navigate("/auth", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <div className="rounded-lg border border-edge bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ProfileCard user={user} />
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </div>

      <GameHistoryPanel />

      <EditProfileForm
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
