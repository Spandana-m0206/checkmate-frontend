import { useState } from "react";
import Button from "../../component/ui/Button";
import MenuButton from "./component/MenuButton";
import {
  QueueStatus,
  RoomCodeDisplay,
  JoinRoomForm,
  useMatchmakingStore,
} from "../matchmaking";
import { getSocket } from "../../services/socket";
import boardImage from "../../assets/board/board.png";

type HomeView = "menu" | "friend";

export default function HomePage() {
  const { status, roomCode, error } = useMatchmakingStore();
  const clearError = useMatchmakingStore((s) => s.clearError);
  const [view, setView] = useState<HomeView>("menu");

  // Clear any previous server error so a stale message never outlives the
  // next attempt.
  function emit(event: string) {
    clearError();
    getSocket()?.emit(event);
  }

  function showView(next: HomeView) {
    clearError();
    setView(next);
  }

  // Queuing overlay
  if (status === "queuing") {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <QueueStatus />
      </div>
    );
  }

  // Waiting in private room
  if (status === "in-room-waiting" && roomCode) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <RoomCodeDisplay code={roomCode} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4 md:flex-row">
        {/* Play panel */}
        <div className="w-full rounded-lg border border-edge bg-surface p-5 md:max-w-xs">
          {view === "menu" ? (
            <>
              <h1 className="text-xl font-bold text-content">Play Chess</h1>
              <p className="mt-1 text-sm text-content-muted">
                30 seconds per move
              </p>

              <div className="mt-4 space-y-2">
                <Button onClick={() => emit("joinQueue")} className="w-full">
                  Play Online
                </Button>

                <MenuButton
                  icon="🤖"
                  label="Play Bot"
                  onClick={() => emit("startBotGame")}
                />
                <MenuButton
                  icon="🤝"
                  label="Play with Friend"
                  onClick={() => showView("friend")}
                />
                <MenuButton icon="👤" label="Profile" to="/profile" />
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => showView("menu")}
                className="flex items-center gap-2 text-sm font-semibold text-content-muted transition-colors hover:text-content"
              >
                <span aria-hidden="true">←</span> Play with Friend
              </button>

              <div className="mt-4 space-y-3">
                <Button onClick={() => emit("createRoom")} className="w-full">
                  Create Room
                </Button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-edge" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-content-subtle">
                    or
                  </span>
                  <div className="h-px flex-1 bg-edge" />
                </div>

                <JoinRoomForm />
              </div>
            </>
          )}

          {error && <p className="mt-3 text-sm text-danger-hover">{error}</p>}
        </div>

        {/* Board preview */}
        <div className="hidden flex-1 md:block">
          <img
            src={boardImage}
            alt=""
            className="w-full rounded-lg"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
