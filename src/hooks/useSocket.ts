import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useMatchmakingStore } from "../feature/matchmaking/store";
import { useGameStore } from "../feature/game/store";
import type {
  GameStartedPayload,
  MoveMadePayload,
  MoveRejectedPayload,
  GameEndedPayload,
  GameStatePayload,
  RoomCreatedPayload,
  OpponentDisconnectedPayload,
  OpponentReconnectedPayload,
  SocketErrorPayload,
} from "../feature/game/type";

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    // --- Matchmaking events ---

    socket.on("queueJoined", () => {
      useMatchmakingStore.getState().setQueuing();
    });

    socket.on("queueLeft", () => {
      useMatchmakingStore.getState().setIdle();
    });

    socket.on("roomCreated", (data: RoomCreatedPayload) => {
      useMatchmakingStore.getState().setRoomCreated(data.code);
    });

    socket.on("gameStarted", (data: GameStartedPayload) => {
      useGameStore.getState().setGameStarted(data);
      useMatchmakingStore.getState().reset();
      navigateRef.current(`/game/${data.gameId}`);
    });

    // --- Game events ---

    socket.on("moveMade", (data: MoveMadePayload) => {
      useGameStore.getState().setMoveMade(data);
    });

    socket.on("moveRejected", (_data: MoveRejectedPayload) => {
      // Handled by the game page via store or local state
    });

    socket.on("gameEnded", (data: GameEndedPayload) => {
      useGameStore.getState().setGameEnded(data);
    });

    socket.on("gameState", (data: GameStatePayload) => {
      const store = useGameStore.getState();
      store.setGameState(data);
      if (!store.myColor) {
        const userId = useAuthStore.getState().user?._id;
        if (userId) {
          const color =
            data.whitePlayerId === userId ? "white" : "black";
          useGameStore.setState({ myColor: color });
        }
      }
      navigateRef.current(`/game/${data.gameId}`);
    });

    socket.on(
      "opponentDisconnected",
      (_data: OpponentDisconnectedPayload) => {
        useGameStore.getState().setOpponentConnected(false);
      },
    );

    socket.on(
      "opponentReconnected",
      (_data: OpponentReconnectedPayload) => {
        useGameStore.getState().setOpponentConnected(true);
      },
    );

    socket.on("error", (_data: SocketErrorPayload) => {
      // Could set an error toast store here in the future
    });

    return () => {
      socket.removeAllListeners();
      disconnectSocket();
    };
  }, [token]);
}
