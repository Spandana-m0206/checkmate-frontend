import { create } from "zustand";

type MatchmakingStatus = "idle" | "queuing" | "in-room-waiting" | "joining-room";

interface MatchmakingState {
  status: MatchmakingStatus;
  roomCode: string | null;
  /** Last message from the server's `error` event, shown inline on Home. */
  error: string | null;
  setQueuing: () => void;
  setIdle: () => void;
  setRoomCreated: (code: string) => void;
  setJoiningRoom: () => void;
  setError: (message: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  status: "idle",
  roomCode: null,
  error: null,

  setQueuing: () => set({ status: "queuing", roomCode: null, error: null }),
  setIdle: () => set({ status: "idle", roomCode: null }),
  setRoomCreated: (code) =>
    set({ status: "in-room-waiting", roomCode: code, error: null }),
  setJoiningRoom: () => set({ status: "joining-room", roomCode: null }),
  setError: (message) => set({ status: "idle", roomCode: null, error: message }),
  clearError: () => set({ error: null }),
  reset: () => set({ status: "idle", roomCode: null, error: null }),
}));
