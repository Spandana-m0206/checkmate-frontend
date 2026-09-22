import { useState } from "react";
import Spinner from "../../../component/ui/Spinner";
import Button from "../../../component/ui/Button";
import Modal from "../../../component/ui/Modal";
import { getSocket } from "../../../services/socket";

interface RoomCodeDisplayProps {
  code: string;
}

export default function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirmLeave() {
    getSocket()?.emit("cancelRoom");
    setConfirmOpen(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-edge bg-surface p-8 shadow-raised">
        <p className="text-sm text-content-muted">
          Share this code with your opponent
        </p>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-surface-sunken px-4 py-2 font-mono text-2xl font-bold tracking-widest text-accent">
            {code}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-md border border-edge p-2 text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
            aria-label="Copy code"
          >
            {copied ? (
              <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-content-subtle">
          <Spinner size="sm" />
          Waiting for opponent to join...
        </div>
        <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
          Cancel
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="mb-2 text-lg font-semibold text-content">
          Leave room?
        </h2>
        <p className="mb-4 text-sm text-content-muted">
          Are you sure you want to leave the room? The room code will be
          invalidated.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmLeave}
            className="flex-1"
          >
            Leave
          </Button>
        </div>
      </Modal>
    </>
  );
}
