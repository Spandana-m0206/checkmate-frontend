import type { GameResult } from "../feature/game/type";

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getResultLabel(result: GameResult): string {
  switch (result) {
    case "CHECKMATE":
      return "Checkmate";
    case "RESIGNATION":
      return "Resignation";
    case "TIMEOUT":
      return "Timeout";
    case "DRAW":
      return "Draw";
    default:
      return result;
  }
}

export function getOutcome(
  result: GameResult | null,
  winnerId: string | null,
  myId: string,
): "win" | "loss" | "draw" {
  if (result === "DRAW") return "draw";
  if (winnerId === myId) return "win";
  return "loss";
}
