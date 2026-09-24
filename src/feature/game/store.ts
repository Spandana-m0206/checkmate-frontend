import { create } from "zustand";
import type {
  GameResult,
  GameStatus,
  PieceColor,
  MoveNotation,
  GameStartedPayload,
  MoveMadePayload,
  GameEndedPayload,
  GameStatePayload,
} from "./type";

interface GameState {
  gameId: string | null;
  fen: string | null;
  myColor: PieceColor | null;
  currentTurn: PieceColor;
  turnStartedAt: number | null;
  moveNumber: number;
  moves: MoveNotation[];
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  whiteUsername: string | null;
  whiteProfileImage: string | null;
  blackUsername: string | null;
  blackProfileImage: string | null;
  botPlayerId: string | null;
  status: GameStatus | null;
  result: GameResult | null;
  winnerId: string | null;
  selectedSquare: string | null;
  legalMoves: string[];
  isCheck: boolean;
  opponentConnected: boolean;
  lastMove: { from: string; to: string } | null;

  setGameStarted: (data: GameStartedPayload) => void;
  setMoveMade: (data: MoveMadePayload) => void;
  setGameEnded: (data: GameEndedPayload) => void;
  setGameState: (data: GameStatePayload) => void;
  selectSquare: (square: string | null) => void;
  setLegalMoves: (moves: string[]) => void;
  setOpponentConnected: (connected: boolean) => void;
  resetGame: () => void;
}

const initialState = {
  gameId: null,
  fen: null,
  myColor: null,
  currentTurn: "white" as PieceColor,
  turnStartedAt: null,
  moveNumber: 0,
  moves: [],
  whitePlayerId: null,
  blackPlayerId: null,
  whiteUsername: null,
  whiteProfileImage: null,
  blackUsername: null,
  blackProfileImage: null,
  botPlayerId: null,
  status: null,
  result: null,
  winnerId: null,
  selectedSquare: null,
  legalMoves: [],
  isCheck: false,
  opponentConnected: true,
  lastMove: null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setGameStarted: (data) =>
    set({
      gameId: data.gameId,
      fen: data.fen,
      myColor: data.yourColor,
      currentTurn: "white",
      turnStartedAt: data.turnStartedAt,
      moveNumber: 0,
      moves: [],
      whitePlayerId: data.whitePlayerId,
      blackPlayerId: data.blackPlayerId,
      whiteUsername: data.whiteUsername,
      whiteProfileImage: data.whiteProfileImage,
      blackUsername: data.blackUsername,
      blackProfileImage: data.blackProfileImage,
      botPlayerId: data.botPlayerId ?? null,
      status: "ACTIVE",
      result: null,
      winnerId: null,
      selectedSquare: null,
      legalMoves: [],
      isCheck: false,
      opponentConnected: true,
      lastMove: null,
    }),

  setMoveMade: (data) =>
    set((state) => ({
      fen: data.fen,
      currentTurn: data.currentTurn,
      turnStartedAt: data.turnStartedAt,
      moveNumber: data.moveNumber,
      isCheck: data.isCheck,
      lastMove: { from: data.from, to: data.to },
      selectedSquare: null,
      legalMoves: [],
      moves: [
        ...state.moves,
        {
          notation: data.notation,
          moveNumber: data.moveNumber,
          capturedPiece: data.capturedPiece,
        },
      ],
    })),

  setGameEnded: (data) =>
    set({
      status: data.status,
      result: data.result,
      winnerId: data.winnerId,
      selectedSquare: null,
      legalMoves: [],
    }),

  setGameState: (data) =>
    set({
      gameId: data.gameId,
      fen: data.fen,
      whitePlayerId: data.whitePlayerId,
      blackPlayerId: data.blackPlayerId,
      currentTurn: data.currentTurn,
      turnStartedAt: data.turnStartedAt,
      moveNumber: data.moveNumber,
      status: data.status,
      lastMove: data.lastMove,
      selectedSquare: null,
      legalMoves: [],
      isCheck: false,
      opponentConnected: true,
    }),

  selectSquare: (square) => set({ selectedSquare: square }),
  setLegalMoves: (moves) => set({ legalMoves: moves }),
  setOpponentConnected: (connected) => set({ opponentConnected: connected }),
  resetGame: () => set(initialState),
}));
