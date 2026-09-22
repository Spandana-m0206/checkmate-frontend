import { useNavigate } from "react-router";
import Button from "../../../component/ui/Button";
import { useGameStore } from "../store";
import { useAuthStore } from "../../../store/useAuthStore";
import type { GameResult } from "../type";

function getResultText(
  result: GameResult,
  winnerId: string | null,
  myId: string,
): { title: string; subtitle: string } {
  const iWon = winnerId === myId;

  switch (result) {
    case "CHECKMATE":
      return {
        title: iWon ? "You Win!" : "You Lose",
        subtitle: "Checkmate",
      };
    case "RESIGNATION":
      return {
        title: iWon ? "You Win!" : "You Lose",
        subtitle: iWon ? "Opponent resigned" : "You resigned",
      };
    case "TIMEOUT":
      return {
        title: iWon ? "You Win!" : "You Lose",
        subtitle: iWon ? "Opponent ran out of time" : "You ran out of time",
      };
    case "DRAW":
      return {
        title: "Draw",
        subtitle: "Stalemate",
      };
    default:
      return { title: "Game Over", subtitle: "" };
  }
}

export default function GameEndOverlay() {
  const navigate = useNavigate();
  const gameId = useGameStore((s) => s.gameId);
  const result = useGameStore((s) => s.result);
  const winnerId = useGameStore((s) => s.winnerId);
  const resetGame = useGameStore((s) => s.resetGame);
  const myId = useAuthStore((s) => s.user?._id) ?? "";

  if (!result) return null;

  const { title, subtitle } = getResultText(result, winnerId, myId);
  const iWon = winnerId === myId;
  const isDraw = result === "DRAW";

  function handleHome() {
    resetGame();
    navigate("/home");
  }

  function handleHistory() {
    resetGame();
    navigate(`/history/${gameId}`);
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xs rounded-xl bg-white p-6 text-center shadow-xl dark:bg-gray-800">
        <h2
          className={`text-2xl font-bold ${
            isDraw
              ? "text-gray-700 dark:text-gray-300"
              : iWon
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
          }`}
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={handleHome} className="flex-1">
            Home
          </Button>
          <Button onClick={handleHistory} className="flex-1">
            View Game
          </Button>
        </div>
      </div>
    </div>
  );
}
