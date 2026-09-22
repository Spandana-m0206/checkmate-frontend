import type { ReactNode } from "react";
import { isLightSquare } from "../../../utils/chess";

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
  const light = isLightSquare(square);

  let bg: string;
  if (isKingInCheck) {
    bg = "bg-red-400/70 dark:bg-red-500/60";
  } else if (isSelected) {
    bg = "bg-yellow-300/60 dark:bg-yellow-400/40";
  } else if (isLastMove) {
    bg = light
      ? "bg-yellow-200/50 dark:bg-yellow-300/20"
      : "bg-yellow-300/40 dark:bg-yellow-400/20";
  } else {
    bg = light
      ? "bg-amber-100/40 dark:bg-amber-200/10"
      : "bg-amber-800/30 dark:bg-amber-900/40";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center ${bg} transition-colors`}
      aria-label={square}
    >
      {children}
    </button>
  );
}
