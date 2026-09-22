import Avatar from "../../../component/ui/Avatar";
import type { User } from "../../auth/type";
import { formatDate } from "../../../utils/format";

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar src={user.profileImage} alt={user.name} size="lg" />

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {user.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          @{user.username}
        </p>
      </div>

      <div className="w-full space-y-3">
        <ProfileField label="Email" value={user.email} />
        <ProfileField
          label="Date of Birth"
          value={formatDate(user.dateOfBirth)}
        />
        <ProfileField
          label="Joined"
          value={formatDate(user.createdAt)}
        />
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-2.5 dark:bg-gray-700/50">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}
