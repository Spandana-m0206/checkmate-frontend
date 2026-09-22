import Spinner from "../../../component/ui/Spinner";
import Button from "../../../component/ui/Button";
import { getSocket } from "../../../services/socket";

export default function QueueStatus() {
  function handleCancel() {
    getSocket()?.emit("leaveQueue");
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <Spinner size="lg" />
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Searching for opponent...
      </p>
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  );
}
