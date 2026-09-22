import type { ReactNode } from "react";

interface SquareProps {
  square: string;
  isSelected: boolean;
  isLastMove: boolean;
  isKingInCheck: boolean;
  onClick: () => void;
  children?: ReactNode;
}

export default function Square({
  square,
  isSelected,
  isLastMove,
  isKingInCheck,
  onClick,
  children,
}: SquareProps) {
  // Default: transparent — the board.png image shows through.
  // Only apply overlay colors for interactive states.
  let overlay = "";
  if (isKingInCheck) {
    overlay = "bg-board-check";
  } else if (isSelected) {
    overlay = "bg-board-highlight";
  } else if (isLastMove) {
    overlay = "bg-board-highlight-soft";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center transition-colors ${overlay}`}
      aria-label={square}
    >
      {children}
    </button>
  );
}
