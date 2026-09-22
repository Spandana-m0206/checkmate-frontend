import { useState, useEffect } from "react";
import GameHistoryCard from "./GameHistoryCard";
import Button from "../../../component/ui/Button";
import Spinner from "../../../component/ui/Spinner";
import { listGames } from "../service";
import { useAuthStore } from "../../../store/useAuthStore";
import boardImage from "../../../assets/board/board.png";
import type { Game, Pagination } from "../type";

const PAGE_SIZE = 10;

export default function GameHistoryPanel() {
  const myId = useAuthStore((s) => s.user?._id) ?? "";
  const [games, setGames] = useState<Game[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await listGames(1, PAGE_SIZE);
        setGames(res.data.games);
        setPagination(res.data.pagination);
      } catch {
        setError("Failed to load game history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLoadMore() {
    if (!pagination || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const res = await listGames(pagination.page + 1, pagination.limit);
      setGames((prev) => [...prev, ...res.data.games]);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load more games");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = pagination
    ? pagination.page < pagination.totalPages
    : false;

  return (
    <section className="overflow-hidden rounded-lg border border-edge bg-surface">
      <header className="border-b border-edge px-4 py-3">
        <h2 className="font-bold text-content">
          Game History{" "}
          <span className="text-content-subtle">({pagination?.total ?? 0})</span>
        </h2>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <img src={boardImage} alt="" className="h-12 w-12 rounded opacity-40" />
            <p className="font-semibold text-content">No Game History</p>
            <p className="text-sm text-content-subtle">
              Completed games will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <GameHistoryCard key={game._id} game={game} myId={myId} />
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-danger-hover">{error}</p>}

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              loading={loadingMore}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
