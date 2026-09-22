import { getPieceSymbol } from "../../../utils/chess";

interface PieceProps {
  color: string;
  type: string;
}

export default function Piece({ color, type }: PieceProps) {
  return (
    <span
      className="pointer-events-none select-none text-[min(5vw,2.5rem)] leading-none drop-shadow-sm sm:text-[min(4vw,3rem)] lg:text-4xl"
      aria-label={`${color === "w" ? "White" : "Black"} ${type}`}
    >
      {getPieceSymbol(color, type)}
    </span>
  );
}
