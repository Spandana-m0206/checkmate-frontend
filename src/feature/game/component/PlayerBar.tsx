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
    <div className="flex items-center justify-between rounded-md border border-edge bg-surface px-3 py-2">
      <div className="flex items-center gap-2">
        <Avatar src={profileImage} alt={name} size="sm" />
        <span className="text-sm font-semibold text-content">
          {name}
        </span>
        {isCurrentTurn && isGameActive && (
          <span className="h-2 w-2 rounded-full bg-accent" aria-label="Active turn" />
        )}
      </div>
      <TurnTimer seconds={timerSeconds} isActive={isCurrentTurn && isGameActive} />
    </div>
  );
}
