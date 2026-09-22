import Modal from "../../../component/ui/Modal";
import { getPieceImage } from "../../../utils/chess";

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
        <h2 className="mb-4 text-lg font-semibold text-content">
          Promote pawn to
        </h2>
        <div className="flex justify-center gap-3">
          {PROMOTION_PIECES.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-edge bg-surface-sunken transition-colors hover:border-accent hover:bg-surface-raised"
              aria-label={PIECE_NAMES[piece]}
            >
              <img
                src={getPieceImage(color, piece)}
                alt={PIECE_NAMES[piece]}
                className="h-10 w-10"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
