import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import Spinner from "../../component/ui/Spinner";
import Avatar from "../../component/ui/Avatar";
import MoveTable from "./component/MoveTable";
import { getGameDetail } from "./service";
import { useAuthStore } from "../../store/useAuthStore";
import { formatDateTime, getResultLabel, getOutcome } from "../../utils/format";
import type { Game, Move } from "./type";

export default function HistoryDetailPage() {
  const { gameId } = useParams();
  const myId = useAuthStore((s) => s.user?._id) ?? "";
  const [game, setGame] = useState<Game | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!gameId) return;
    async function load() {
      try {
        const res = await getGameDetail(gameId!);
        setGame(res.data.game);
        setMoves(res.data.moves);
      } catch {
        setError("Failed to load game details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-red-600 dark:text-red-400">{error || "Game not found"}</p>
        <Link to="/history" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          Back to history
        </Link>
      </div>
    );
  }

  const outcome = getOutcome(game.result, game.winnerId?._id ?? null, myId);
  const isWhite = game.whitePlayerId._id === myId;
  const opponent = isWhite ? game.blackPlayerId : game.whitePlayerId;

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <Link
        to="/history"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to history
      </Link>

      <div className="mb-6 rounded-lg bg-white p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={opponent.profileImage} alt={opponent.name} size="lg" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                vs {opponent.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{opponent.username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-lg font-bold capitalize ${
                outcome === "win"
                  ? "text-green-600 dark:text-green-400"
                  : outcome === "loss"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {outcome}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getResultLabel(game.result!)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{game.totalMoves} moves</span>
          <span>Played as {isWhite ? "white" : "black"}</span>
          <span>{formatDateTime(game.endedAt!)}</span>
        </div>
      </div>

      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Moves
      </h2>
      {moves.length > 0 ? (
        <MoveTable moves={moves} whitePlayerId={game.whitePlayerId._id} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No moves recorded</p>
      )}
    </div>
  );
}
