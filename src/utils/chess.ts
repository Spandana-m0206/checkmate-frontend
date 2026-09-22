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

// --- Piece image imports ---
import wp from "../assets/pieces/wp.png";
import wn from "../assets/pieces/wn.png";
import wb from "../assets/pieces/wb.png";
import wr from "../assets/pieces/wr.png";
import wq from "../assets/pieces/wq.png";
import wk from "../assets/pieces/wk.png";
import bp from "../assets/pieces/bp.png";
import bn from "../assets/pieces/bn.png";
import bb from "../assets/pieces/bb.png";
import br from "../assets/pieces/br.png";
import bq from "../assets/pieces/bq.png";
import bk from "../assets/pieces/bk.png";

const PIECE_IMAGES: Record<string, Record<string, string>> = {
  w: { k: wk, q: wq, r: wr, b: wb, n: wn, p: wp },
  b: { k: bk, q: bq, r: br, b: bb, n: bn, p: bp },
};

export function getPieceImage(color: string, type: string): string {
  return PIECE_IMAGES[color]?.[type] ?? "";
}
