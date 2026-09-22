import Avatar from "../../../component/ui/Avatar";
import type { User } from "../../auth/type";
import { formatDate } from "../../../utils/format";

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="flex min-w-0 flex-1 items-start gap-4">
      <Avatar src={user.profileImage} alt={user.name} size="xl" />

      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold text-content">
          {user.username}
        </h1>
        <p className="truncate text-content-muted">{user.name}</p>

        <p className="mt-2 text-sm text-content-subtle">
          Joined {formatDate(user.createdAt)}
        </p>
        <p className="truncate text-sm text-content-subtle">
          {user.email} · Born {formatDate(user.dateOfBirth)}
        </p>
      </div>
    </div>
  );
}
