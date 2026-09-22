import Avatar from "../../../component/ui/Avatar";
import TurnTimer from "./TurnTimer";

interface PlayerBarProps {
  name: string;
  profileImage?: string | null;
  isCurrentTurn: boolean;
  timerSeconds: number;
  isGameActive: boolean;
}

export default function PlayerBar({
  name,
  profileImage,
  isCurrentTurn,
  timerSeconds,
  isGameActive,
}: PlayerBarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <Avatar src={profileImage} alt={name} size="sm" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {name}
        </span>
        {isCurrentTurn && isGameActive && (
          <span className="h-2 w-2 rounded-full bg-green-500" aria-label="Active turn" />
        )}
      </div>
      <TurnTimer seconds={timerSeconds} isActive={isCurrentTurn && isGameActive} />
    </div>
  );
}
