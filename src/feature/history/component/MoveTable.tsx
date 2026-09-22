import type { Move } from "../type";

interface MoveTableProps {
  moves: Move[];
  whitePlayerId: string;
}

export default function MoveTable({ moves, whitePlayerId }: MoveTableProps) {
  const pairs: Array<{
    num: number;
    white?: string;
    black?: string;
  }> = [];

  for (const move of moves) {
    const isWhite = move.playerId === whitePlayerId;
    const pairIndex = Math.floor((move.moveNumber - 1) / 2);
    const pairNum = pairIndex + 1;

    if (!pairs[pairIndex]) {
      pairs[pairIndex] = { num: pairNum };
    }

    if (isWhite) {
      pairs[pairIndex].white = move.notation ?? `${move.from}-${move.to}`;
    } else {
      pairs[pairIndex].black = move.notation ?? `${move.from}-${move.to}`;
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-edge">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface">
            <th className="w-12 px-3 py-2 text-left font-semibold text-content-subtle">
              #
            </th>
            <th className="px-3 py-2 text-left font-semibold text-content-subtle">
              White
            </th>
            <th className="px-3 py-2 text-left font-semibold text-content-subtle">
              Black
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr
              key={pair.num}
              className="border-t border-edge/60 bg-surface-sunken"
            >
              <td className="px-3 py-1.5 font-mono text-content-subtle">
                {pair.num}
              </td>
              <td className="px-3 py-1.5 font-mono font-medium text-content">
                {pair.white ?? ""}
              </td>
              <td className="px-3 py-1.5 font-mono font-medium text-content">
                {pair.black ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
