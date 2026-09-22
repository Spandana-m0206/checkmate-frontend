import { Link } from "react-router";
import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/checkmate-logo.svg";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex h-14 items-center justify-between border-b border-edge bg-surface px-4">
      <Link to="/home" className="flex items-center gap-2">
        <img src={logo} alt="" className="h-7 w-7" />
        <span className="text-lg font-bold text-content">Checkmate</span>
      </Link>

      {user && (
        <Link to="/profile" aria-label="Profile">
          <Avatar src={user.profileImage} alt={user.name} size="sm" />
        </Link>
      )}
    </header>
  );
}
