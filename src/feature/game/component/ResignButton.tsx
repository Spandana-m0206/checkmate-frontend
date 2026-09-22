import { useState } from "react";
import Button from "../../../component/ui/Button";
import Modal from "../../../component/ui/Modal";
import { getSocket } from "../../../services/socket";
import { useGameStore } from "../store";

export default function ResignButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const gameId = useGameStore((s) => s.gameId);

  function handleResign() {
    if (gameId) {
      getSocket()?.emit("resign", { gameId });
    }
    setConfirmOpen(false);
  }

  return (
    <>
      <Button variant="danger" onClick={() => setConfirmOpen(true)}>
        Resign
      </Button>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Resign?
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to resign? Your opponent will win the game.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleResign} className="flex-1">
            Resign
          </Button>
        </div>
      </Modal>
    </>
  );
}
