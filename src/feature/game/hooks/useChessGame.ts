import { useRef, useCallback, useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { useGameStore } from "../store";

export function useChessGame() {
  const chessRef = useRef(new Chess());
  const fen = useGameStore((s) => s.fen);
  const myColor = useGameStore((s) => s.myColor);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const status = useGameStore((s) => s.status);

  // Sync chess.js instance with store FEN
  if (fen && chessRef.current.fen() !== fen) {
    chessRef.current.load(fen);
  }

  const isMyTurn = currentTurn === myColor && status === "ACTIVE";

  const board = useMemo(() => {
    if (!fen) return null;
    return chessRef.current.board();
  }, [fen]);

  const getLegalMoves = useCallback(
    (square: string): string[] => {
      if (!isMyTurn) return [];
      try {
        const moves = chessRef.current.moves({
          square: square as Square,
          verbose: true,
        });
        return moves.map((m) => m.to);
      } catch {
        return [];
      }
    },
    [isMyTurn],
  );

  const getPieceAt = useCallback(
    (square: string) => {
      return chessRef.current.get(square as Square);
    },
    [fen],
  );

  const isPromotion = useCallback(
    (from: string, to: string): boolean => {
      const piece = chessRef.current.get(from as Square);
      if (!piece || piece.type !== "p") return false;
      const rank = to[1];
      return (piece.color === "w" && rank === "8") || (piece.color === "b" && rank === "1");
    },
    [fen],
  );

  return {
    board,
    isMyTurn,
    getLegalMoves,
    getPieceAt,
    isPromotion,
  };
}
