import { useCallback, useState } from "react";
import Square from "./Square";
import Piece from "./Piece";
import LegalMoveIndicator from "./LegalMoveIndicator";
import PromotionModal from "./PromotionModal";
import { useGameStore } from "../store";
import { useChessGame } from "../hooks/useChessGame";
import { getSquaresForOrientation } from "../../../utils/chess";
import { getSocket } from "../../../services/socket";
import boardImage from "../../../assets/board/board.png";
import type { PieceColor } from "../type";

export default function ChessBoard() {
  const gameId = useGameStore((s) => s.gameId);
  const myColor = useGameStore((s) => s.myColor);
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const legalMovesInStore = useGameStore((s) => s.legalMoves);
  const lastMove = useGameStore((s) => s.lastMove);
  const isCheck = useGameStore((s) => s.isCheck);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const status = useGameStore((s) => s.status);
  const selectSquare = useGameStore((s) => s.selectSquare);
  const setLegalMoves = useGameStore((s) => s.setLegalMoves);

  const { board, isMyTurn, getLegalMoves, getPieceAt, isPromotion } =
    useChessGame();

  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const orientation: PieceColor = myColor ?? "white";
  const squares = getSquaresForOrientation(orientation);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (status !== "ACTIVE") return;

      const piece = getPieceAt(square);
      const myChessColor = myColor === "white" ? "w" : "b";

      // If a square is already selected and this square is a legal move
      if (selectedSquare && legalMovesInStore.includes(square)) {
        // Check for promotion
        if (isPromotion(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        // Emit the move
        getSocket()?.emit("makeMove", {
          gameId,
          from: selectedSquare,
          to: square,
        });
        selectSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking own piece, select it and show legal moves
      if (piece && piece.color === myChessColor && isMyTurn) {
        selectSquare(square);
        setLegalMoves(getLegalMoves(square));
        return;
      }

      // Clicking empty or opponent piece with no selection
      selectSquare(null);
      setLegalMoves([]);
    },
    [
      gameId,
      myColor,
      selectedSquare,
      legalMovesInStore,
      status,
      isMyTurn,
      getPieceAt,
      getLegalMoves,
      isPromotion,
      selectSquare,
      setLegalMoves,
    ],
  );

  function handlePromotion(piece: "q" | "r" | "b" | "n") {
    if (!pendingPromotion) return;
    getSocket()?.emit("makeMove", {
      gameId,
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: piece,
    });
    setPendingPromotion(null);
    selectSquare(null);
    setLegalMoves([]);
  }

  if (!board) {
    return (
      <div className="aspect-square w-full rounded-lg bg-surface-sunken" />
    );
  }

  // Find king square for check highlight
  let kingInCheckSquare: string | null = null;
  if (isCheck) {
    const kingColor = currentTurn === "white" ? "w" : "b";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === "k" && p.color === kingColor) {
          const files = "abcdefgh";
          kingInCheckSquare = files[c] + (8 - r);
        }
      }
    }
  }

  return (
    <div className="relative aspect-square w-full">
      {/* Board background image */}
      <img
        src={boardImage}
        alt=""
        className="absolute inset-0 h-full w-full rounded-lg"
        draggable={false}
      />

      {/* 8×8 transparent interaction grid on top of the board image */}
      <div className="relative grid h-full w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-lg">
        {squares.flat().map((square) => {
          const piece = getPieceAt(square);
          const isSelected = selectedSquare === square;
          const isLegal = legalMovesInStore.includes(square);
          const isLastMoveSquare =
            lastMove?.from === square || lastMove?.to === square;
          const isKingInCheck = kingInCheckSquare === square;

          return (
            <Square
              key={square}
              square={square}
              isSelected={isSelected}
              isLastMove={isLastMoveSquare}
              isKingInCheck={isKingInCheck}
              onClick={() => handleSquareClick(square)}
            >
              {piece && <Piece color={piece.color} type={piece.type} />}
              {isLegal && <LegalMoveIndicator isCapture={!!piece} />}
            </Square>
          );
        })}
      </div>

      {pendingPromotion && (
        <PromotionModal
          color={myColor === "white" ? "w" : "b"}
          onSelect={handlePromotion}
        />
      )}
    </div>
  );
}
