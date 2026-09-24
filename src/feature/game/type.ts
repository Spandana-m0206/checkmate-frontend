export type GameStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";
export type GameResult = "CHECKMATE" | "RESIGNATION" | "TIMEOUT" | "DRAW";
export type PieceColor = "white" | "black";
export type GameMode = "MULTIPLAYER" | "BOT";

export interface MoveNotation {
  notation: string;
  moveNumber: number;
  capturedPiece: string | null;
}

// --- Socket event payloads ---

export interface GameStartedPayload {
  gameId: string;
  whitePlayerId: string;
  blackPlayerId: string;
  whiteUsername: string;
  whiteProfileImage: string | null;
  blackUsername: string;
  blackProfileImage: string | null;
  fen: string;
  yourColor: PieceColor;
  turnStartedAt: number;
  // Bot games only — absent means MULTIPLAYER.
  mode?: GameMode;
  botPlayerId?: string;
}

export interface MoveMadePayload {
  gameId: string;
  from: string;
  to: string;
  piece: string;
  capturedPiece: string | null;
  promotion: string | null;
  notation: string;
  fen: string;
  moveNumber: number;
  currentTurn: PieceColor;
  isCheck: boolean;
  turnStartedAt: number;
}

export interface MoveRejectedPayload {
  gameId: string;
  reason: string;
}

export interface GameEndedPayload {
  gameId: string;
  status: GameStatus;
  result: GameResult;
  winnerId: string;
  // Bot games only.
  isBotGame?: boolean;
  botPlayerId?: string;
}

export interface GameStatePayload {
  gameId: string;
  fen: string;
  whitePlayerId: string;
  blackPlayerId: string;
  currentTurn: PieceColor;
  turnStartedAt: number;
  moveNumber: number;
  status: GameStatus;
  lastMove: { from: string; to: string } | null;
}

export interface RoomCreatedPayload {
  code: string;
}

export interface OpponentDisconnectedPayload {
  gameId: string;
}

export interface OpponentReconnectedPayload {
  gameId: string;
}

export interface SocketErrorPayload {
  message: string;
}
