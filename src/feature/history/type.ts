import type { GameStatus, GameResult } from "../game/type";

export interface PlayerInfo {
  _id: string;
  username: string;
  name: string;
  profileImage?: string | null;
}

export interface Game {
  _id: string;
  whitePlayerId: PlayerInfo;
  blackPlayerId: PlayerInfo;
  winnerId: PlayerInfo | null;
  status: GameStatus;
  result: GameResult | null;
  startedAt: string;
  endedAt: string | null;
  totalMoves: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Move {
  _id: string;
  gameId: string;
  moveNumber: number;
  playerId: string;
  from: string;
  to: string;
  piece: string;
  capturedPiece: string | null;
  promotion: string | null;
  notation: string | null;
  createdAt: string;
  updatedAt: string;
}
