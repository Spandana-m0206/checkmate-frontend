import { useRef, useEffect } from "react";

interface MoveListProps {
  moves: Array<{ notation: string; moveNumber: number }>;
}

export default function MoveList({ moves }: MoveListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  // Group moves into pairs (white, black)
  const pairs: Array<{
    num: number;
    white: string;
    black?: string;
  }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    const pairNum = Math.floor(i / 2) + 1;
    pairs.push({
      num: pairNum,
      white: moves[i].notation,
      black: moves[i + 1]?.notation,
    });
  }

  if (pairs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-content-subtle">
        No moves yet
      </div>
    );
  }

  return (
    <div className="overflow-y-auto text-sm">
      {pairs.map((pair) => (
        <div
          key={pair.num}
          className="flex gap-1 border-b border-edge/60 py-1"
        >
          <span className="w-8 text-right font-mono text-content-subtle">
            {pair.num}.
          </span>
          <span className="w-16 font-mono font-medium text-content">
            {pair.white}
          </span>
          <span className="w-16 font-mono font-medium text-content">
            {pair.black ?? ""}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
