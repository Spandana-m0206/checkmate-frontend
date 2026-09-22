import Spinner from "../../../component/ui/Spinner";
import Button from "../../../component/ui/Button";
import { getSocket } from "../../../services/socket";

export default function QueueStatus() {
  function handleCancel() {
    getSocket()?.emit("leaveQueue");
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-edge bg-surface p-8 shadow-raised">
      <Spinner size="lg" />
      <p className="text-lg font-semibold text-content">
        Searching for opponent...
      </p>
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  );
}
