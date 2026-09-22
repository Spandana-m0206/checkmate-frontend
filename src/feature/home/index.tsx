import { Link } from "react-router";
import Button from "../../component/ui/Button";
import {
  QueueStatus,
  RoomCodeDisplay,
  JoinRoomForm,
  useMatchmakingStore,
} from "../matchmaking";
import { getSocket } from "../../services/socket";

export default function HomePage() {
  const { status, roomCode } = useMatchmakingStore();

  function handleFindMatch() {
    getSocket()?.emit("joinQueue");
  }

  function handleCreateRoom() {
    getSocket()?.emit("createRoom");
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
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Checkmate
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Ready to play?
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleFindMatch} className="w-full">
            Find Match
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              or
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          <Button
            variant="secondary"
            onClick={handleCreateRoom}
            className="w-full"
          >
            Create Private Room
          </Button>

          <JoinRoomForm />
        </div>

        <div className="pt-2">
          <Link
            to="/history"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Game History
          </Link>
        </div>
      </div>
    </div>
  );
}
