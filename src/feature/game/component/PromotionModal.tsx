import Modal from "../../../component/ui/Modal";
import { getPieceSymbol } from "../../../utils/chess";

interface PromotionModalProps {
  color: "w" | "b";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
}

const PROMOTION_PIECES: Array<"q" | "r" | "b" | "n"> = ["q", "r", "b", "n"];
const PIECE_NAMES: Record<string, string> = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

export default function PromotionModal({
  color,
  onSelect,
}: PromotionModalProps) {
  return (
    <Modal open>
      <div className="text-center">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Promote pawn to
        </h2>
        <div className="flex justify-center gap-3">
          {PROMOTION_PIECES.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-gray-200 text-3xl transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-600 dark:hover:border-indigo-400 dark:hover:bg-indigo-900/30"
              aria-label={PIECE_NAMES[piece]}
            >
              {getPieceSymbol(color, piece)}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
