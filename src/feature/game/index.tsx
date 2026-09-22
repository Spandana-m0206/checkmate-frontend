import { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import ChessBoard from "./component/ChessBoard";
import PlayerBar from "./component/PlayerBar";
import MoveList from "./component/MoveList";
import ResignButton from "./component/ResignButton";
import GameEndOverlay from "./component/GameEndOverlay";
import { useGameStore } from "./store";
import { useAuthStore } from "../../store/useAuthStore";
import { useTurnTimer } from "./hooks/useTurnTimer";
import { getSocket } from "../../services/socket";

export default function GamePage() {
  const { gameId: urlGameId } = useParams();
  const navigate = useNavigate();

  const gameId = useGameStore((s) => s.gameId);
  const myColor = useGameStore((s) => s.myColor);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const turnStartedAt = useGameStore((s) => s.turnStartedAt);
  const moves = useGameStore((s) => s.moves);
  const status = useGameStore((s) => s.status);
  const result = useGameStore((s) => s.result);
  const opponentConnected = useGameStore((s) => s.opponentConnected);
  const whitePlayerId = useGameStore((s) => s.whitePlayerId);
  const blackPlayerId = useGameStore((s) => s.blackPlayerId);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!gameId && urlGameId) {
      navigate("/home", { replace: true });
    }
  }, [gameId, urlGameId, navigate]);

  const handleTimeout = useCallback(() => {
    if (gameId && currentTurn === myColor) {
      getSocket()?.emit("moveTimeout", { gameId });
    }
  }, [gameId, currentTurn, myColor]);

  const myTimer = useTurnTimer({
    turnStartedAt: currentTurn === myColor ? turnStartedAt : null,
    isActive: status === "ACTIVE",
    onTimeout: handleTimeout,
  });

  const opponentTimer = useTurnTimer({
    turnStartedAt: currentTurn !== myColor ? turnStartedAt : null,
    isActive: status === "ACTIVE",
    onTimeout: () => {},
  });

  if (!gameId || !myColor || !user) {
    return null;
  }

  const isWhite = myColor === "white";
  const myName = user.username;
  const myImage = user.profileImage;

  const opponentId = isWhite ? blackPlayerId : whitePlayerId;
  const opponentName = opponentId ? `Player ${opponentId.slice(-4)}` : "Opponent";

  const topIsCurrentTurn = currentTurn === (isWhite ? "black" : "white");
  const bottomIsCurrentTurn = currentTurn === myColor;

  return (
    <div className="flex flex-1 flex-col items-center gap-2 p-2 lg:flex-row lg:items-start lg:justify-center lg:gap-4 lg:p-4">
      {/* Game area */}
      <div className="flex w-full max-w-[560px] flex-col gap-2">
        {!opponentConnected && status === "ACTIVE" && (
          <div className="rounded-lg bg-yellow-100 px-3 py-2 text-center text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Opponent disconnected — waiting for reconnection...
          </div>
        )}

        <PlayerBar
          name={opponentName}
          isCurrentTurn={topIsCurrentTurn}
          timerSeconds={
            topIsCurrentTurn ? opponentTimer.seconds : myTimer.seconds
          }
          isGameActive={status === "ACTIVE"}
        />

        <div className="relative">
          <ChessBoard />
          {result && <GameEndOverlay />}
        </div>

        <PlayerBar
          name={myName}
          profileImage={myImage}
          isCurrentTurn={bottomIsCurrentTurn}
          timerSeconds={
            bottomIsCurrentTurn ? myTimer.seconds : opponentTimer.seconds
          }
          isGameActive={status === "ACTIVE"}
        />

        {status === "ACTIVE" && (
          <div className="flex justify-center">
            <ResignButton />
          </div>
        )}
      </div>

      <div className="w-full rounded-lg bg-white p-3 dark:bg-gray-800 lg:h-[560px] lg:w-64">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Moves
        </h3>
        <div className="h-40 overflow-y-auto lg:h-[500px]">
          <MoveList moves={moves} />
        </div>
      </div>
    </div>
  );
}
