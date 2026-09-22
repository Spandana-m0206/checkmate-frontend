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
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="w-12 px-3 py-2 text-left text-gray-500 dark:text-gray-400">
              #
            </th>
            <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">
              White
            </th>
            <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">
              Black
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr
              key={pair.num}
              className="border-t border-gray-100 dark:border-gray-700/50"
            >
              <td className="px-3 py-1.5 text-gray-400 dark:text-gray-500">
                {pair.num}
              </td>
              <td className="px-3 py-1.5 font-medium text-gray-900 dark:text-gray-100">
                {pair.white ?? ""}
              </td>
              <td className="px-3 py-1.5 font-medium text-gray-900 dark:text-gray-100">
                {pair.black ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
