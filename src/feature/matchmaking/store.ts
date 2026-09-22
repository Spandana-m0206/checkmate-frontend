import { create } from "zustand";

type MatchmakingStatus = "idle" | "queuing" | "in-room-waiting" | "joining-room";

interface MatchmakingState {
  status: MatchmakingStatus;
  roomCode: string | null;
  setQueuing: () => void;
  setIdle: () => void;
  setRoomCreated: (code: string) => void;
  setJoiningRoom: () => void;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  status: "idle",
  roomCode: null,

  setQueuing: () => set({ status: "queuing", roomCode: null }),
  setIdle: () => set({ status: "idle", roomCode: null }),
  setRoomCreated: (code) => set({ status: "in-room-waiting", roomCode: code }),
  setJoiningRoom: () => set({ status: "joining-room", roomCode: null }),
  reset: () => set({ status: "idle", roomCode: null }),
}));
