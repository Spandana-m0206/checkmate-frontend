import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import ChessBoard from "./component/ChessBoard";
import PlayerBar from "./component/PlayerBar";
import MoveList from "./component/MoveList";
import ResignButton from "./component/ResignButton";
import GameEndOverlay from "./component/GameEndOverlay";
import { useGameStore } from "./store";
import { useAuthStore } from "../../store/useAuthStore";
import { useTurnTimer } from "./hooks/useTurnTimer";
import { getSocket } from "../../services/socket";
import { BOT_NAME } from "../../utils/constants";

/** The bot is a real user, so it is identified by id rather than by mode. */
function opponentLabel(opponentId: string | null, botPlayerId: string | null) {
  if (!opponentId) return "Opponent";
  if (opponentId === botPlayerId) return BOT_NAME;
  return `Player ${opponentId.slice(-4)}`;
}

export default function GamePage() {
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
  const botPlayerId = useGameStore((s) => s.botPlayerId);
  const user = useAuthStore((s) => s.user);

  // A refresh or a direct link lands here with no game in memory, so there is
  // nothing to render. Checked on arrival only: the result overlay clears the
  // store on its way out, and a reactive check would fire on that and replace
  // the navigation already under way with /home.
  useEffect(() => {
    if (!useGameStore.getState().gameId) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

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
  const opponentName = opponentLabel(opponentId, botPlayerId);

  const topIsCurrentTurn = currentTurn === (isWhite ? "black" : "white");
  const bottomIsCurrentTurn = currentTurn === myColor;

  return (
    <div className="flex flex-1 flex-col items-center gap-2 p-2 lg:flex-row lg:items-start lg:justify-center lg:gap-4 lg:p-4">
      {/* Game area */}
      <div className="flex w-full max-w-[560px] flex-col gap-2">
        {!opponentConnected && status === "ACTIVE" && (
          <div className="rounded-md border border-warning/40 bg-warning/15 px-3 py-2 text-center text-sm text-warning">
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

      <div className="w-full rounded-lg border border-edge bg-surface p-3 lg:h-[560px] lg:w-64">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-subtle">
          Moves
        </h3>
        <div className="h-40 overflow-y-auto lg:h-[500px]">
          <MoveList moves={moves} />
        </div>
      </div>
    </div>
  );
}
