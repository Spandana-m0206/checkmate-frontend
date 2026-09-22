import { getPieceImage } from "../../../utils/chess";

interface PieceProps {
  color: string; // "w" | "b"
  type: string; // "k" | "q" | "r" | "b" | "n" | "p"
}

export default function Piece({ color, type }: PieceProps) {
  return (
    <img
      src={getPieceImage(color, type)}
      alt={`${color === "w" ? "White" : "Black"} ${type}`}
      className="pointer-events-none h-[80%] w-[80%] select-none drop-shadow-md"
      draggable={false}
    />
  );
}
