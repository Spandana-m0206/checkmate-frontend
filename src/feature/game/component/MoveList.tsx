import { useRef, useEffect } from "react";

const PIECE_NAMES: Record<string, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
};

interface MoveListProps {
  moves: Array<{
    notation: string;
    moveNumber: number;
    capturedPiece: string | null;
  }>;
  whiteName: string;
  blackName: string;
}

export default function MoveList({ moves, whiteName, blackName }: MoveListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  // Group moves into pairs (white, black)
  const pairs: Array<{
    num: number;
    white: { notation: string; capturedPiece: string | null };
    black?: { notation: string; capturedPiece: string | null };
  }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] ?? undefined,
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Column headers — player names */}
      <div className="flex items-center border-b border-edge px-3 py-2">
        <span className="w-8" />
        <span className="flex-1 truncate text-xs font-semibold uppercase tracking-wider text-content-subtle">
          {whiteName}
        </span>
        <span className="flex-1 truncate text-xs font-semibold uppercase tracking-wider text-content-subtle">
          {blackName}
        </span>
      </div>

      {/* Move rows */}
      <div className="flex-1 overflow-y-auto px-3">
        {pairs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-content-subtle">
            No moves yet
          </div>
        ) : (
          pairs.map((pair) => (
            <div
              key={pair.num}
              className="flex items-baseline border-b border-edge/40 py-1.5"
            >
              <span className="w-8 text-right font-mono text-xs text-content-subtle">
                {pair.num}.
              </span>
              <span className="flex-1">
                <MoveCell
                  notation={pair.white.notation}
                  capturedPiece={pair.white.capturedPiece}
                />
              </span>
              <span className="flex-1">
                {pair.black && (
                  <MoveCell
                    notation={pair.black.notation}
                    capturedPiece={pair.black.capturedPiece}
                  />
                )}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MoveCell({
  notation,
  capturedPiece,
}: {
  notation: string;
  capturedPiece: string | null;
}) {
  const pieceName = capturedPiece ? PIECE_NAMES[capturedPiece] ?? capturedPiece : null;

  return (
    <span className="font-mono text-sm font-medium text-content">
      {notation}
      {pieceName && (
        <span className="ml-1 text-xs text-danger">({pieceName})</span>
      )}
    </span>
  );
}
