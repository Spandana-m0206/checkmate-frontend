import { useState, useEffect } from "react";
import GameHistoryCard from "./component/GameHistoryCard";
import Button from "../../component/ui/Button";
import Spinner from "../../component/ui/Spinner";
import { listGames } from "./service";
import { useAuthStore } from "../../store/useAuthStore";
import type { Game, Pagination } from "./type";

export default function HistoryPage() {
  const myId = useAuthStore((s) => s.user?._id) ?? "";
  const [games, setGames] = useState<Game[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await listGames(1, 10);
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Game History
      </h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {games.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No games played yet
        </p>
      ) : (
        <div className="space-y-2">
          {games.map((game) => (
            <GameHistoryCard key={game._id} game={game} myId={myId} />
          ))}
        </div>
      )}

      {pagination &&
        pagination.page < pagination.totalPages && (
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
  );
}
