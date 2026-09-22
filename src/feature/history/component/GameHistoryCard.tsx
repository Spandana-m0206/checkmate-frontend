import { Link } from "react-router";
import Avatar from "../../../component/ui/Avatar";
import type { Game } from "../type";
import { formatDate, getResultLabel, getOutcome } from "../../../utils/format";

interface GameHistoryCardProps {
  game: Game;
  myId: string;
}

const outcomeColors = {
  win: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  loss: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  draw: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function GameHistoryCard({ game, myId }: GameHistoryCardProps) {
  const isWhite = game.whitePlayerId._id === myId;
  const opponent = isWhite ? game.blackPlayerId : game.whitePlayerId;
  const outcome = getOutcome(game.result, game.winnerId?._id ?? null, myId);

  return (
    <Link
      to={`/history/${game._id}`}
      className="flex items-center gap-3 rounded-lg bg-white p-3 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750"
    >
      <Avatar src={opponent.profileImage} alt={opponent.name} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-gray-900 dark:text-gray-100">
            {opponent.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            @{opponent.username}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{getResultLabel(game.result!)}</span>
          <span>·</span>
          <span>{game.totalMoves} moves</span>
          <span>·</span>
          <span>{formatDate(game.endedAt!)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`h-3 w-3 rounded-full border ${
            isWhite
              ? "border-gray-300 bg-white dark:border-gray-500"
              : "border-gray-600 bg-gray-800 dark:border-gray-400"
          }`}
          aria-label={isWhite ? "Played as white" : "Played as black"}
        />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${outcomeColors[outcome]}`}
        >
          {outcome}
        </span>
      </div>
    </Link>
  );
}
