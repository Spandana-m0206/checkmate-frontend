import { Link } from "react-router";
import ThemeToggle from "../ui/ThemeToggle";
import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/useAuthStore";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
      <Link
        to="/home"
        className="text-lg font-bold text-gray-900 dark:text-gray-100"
      >
        Checkmate
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <Link to="/profile" aria-label="Profile">
            <Avatar src={user.profileImage} alt={user.name} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
