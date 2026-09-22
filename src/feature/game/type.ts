export type GameStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";
export type GameResult = "CHECKMATE" | "RESIGNATION" | "TIMEOUT" | "DRAW";
export type PieceColor = "white" | "black";

export interface MoveNotation {
  notation: string;
  moveNumber: number;
}

// --- Socket event payloads ---

export interface GameStartedPayload {
  gameId: string;
  whitePlayerId: string;
  blackPlayerId: string;
  fen: string;
  yourColor: PieceColor;
  turnStartedAt: number;
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
