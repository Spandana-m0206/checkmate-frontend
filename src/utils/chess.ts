import type { PieceColor } from "../feature/game/type";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

/**
 * Returns the 64 squares in display order for the given orientation.
 * Each entry is a square string like "a1", "e4", etc.
 * Top-left of the returned grid is the top-left of the visual board.
 */
export function getSquaresForOrientation(
  color: PieceColor,
): string[][] {
  const rows: string[][] = [];
  if (color === "white") {
    // Rank 8 at top, rank 1 at bottom
    for (let r = 7; r >= 0; r--) {
      const row: string[] = [];
      for (let f = 0; f < 8; f++) {
        row.push(FILES[f] + RANKS[r]);
      }
      rows.push(row);
    }
  } else {
    // Rank 1 at top, rank 8 at bottom; files reversed (h to a)
    for (let r = 0; r < 8; r++) {
      const row: string[] = [];
      for (let f = 7; f >= 0; f--) {
        row.push(FILES[f] + RANKS[r]);
      }
      rows.push(row);
    }
  }
  return rows;
}

export function isLightSquare(square: string): boolean {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ...
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, ...
  return (file + rank) % 2 !== 0;
}

/**
 * Maps chess.js piece {type, color} to a Unicode chess symbol.
 */
const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { k: "\u2654", q: "\u2655", r: "\u2656", b: "\u2657", n: "\u2658", p: "\u2659" },
  b: { k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F" },
};

export function getPieceSymbol(color: string, type: string): string {
  return PIECE_SYMBOLS[color]?.[type] ?? "";
}
