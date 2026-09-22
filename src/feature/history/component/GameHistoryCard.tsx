import { Link } from "react-router";
import Avatar from "../../../component/ui/Avatar";
import BotBadge from "./BotBadge";
import type { Game } from "../type";
import { formatDate, getResultLabel, getOutcome } from "../../../utils/format";

interface GameHistoryCardProps {
  game: Game;
  myId: string;
}

const outcomeColors = {
  win: "bg-accent/20 text-accent",
  loss: "bg-danger/20 text-danger-hover",
  draw: "bg-surface-raised text-content-muted",
};

export default function GameHistoryCard({ game, myId }: GameHistoryCardProps) {
  const isWhite = game.whitePlayerId._id === myId;
  const opponent = isWhite ? game.blackPlayerId : game.whitePlayerId;
  const outcome = getOutcome(game.result, game.winnerId?._id ?? null, myId);

  return (
    <Link
      to={`/history/${game._id}`}
      className="flex items-center gap-3 rounded-lg border border-edge bg-surface p-3 transition-colors hover:bg-surface-raised"
    >
      <Avatar src={opponent.profileImage} alt={opponent.name} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-content">
            {opponent.name}
          </span>
          {game.mode === "BOT" ? (
            <BotBadge />
          ) : (
            <span className="text-xs text-content-subtle">
              @{opponent.username}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-content-subtle">
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
              ? "border-edge-strong bg-board-light"
              : "border-edge-strong bg-surface-sunken"
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
