import { apiFetch, type ApiResponse } from "../../services/api";
import type { Game, Pagination, Move } from "./type";

interface ListGamesData {
  games: Game[];
  pagination: Pagination;
}

interface GameDetailData {
  game: Game;
  moves: Move[];
}

export function listGames(page = 1, limit = 10) {
  return apiFetch<ApiResponse<ListGamesData>>(
    `/api/v1/games?page=${page}&limit=${limit}`,
  );
}

export function getGameDetail(gameId: string) {
  return apiFetch<ApiResponse<GameDetailData>>(`/api/v1/games/${gameId}`);
}
