interface TurnTimerProps {
  seconds: number;
  isActive: boolean;
}

export default function TurnTimer({ seconds, isActive }: TurnTimerProps) {
  const urgent = isActive && seconds <= 10;
  const display = `0:${seconds.toString().padStart(2, "0")}`;

  return (
    <div
      className={`rounded-lg px-3 py-1 font-mono text-lg font-bold ${
        !isActive
          ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          : urgent
            ? "animate-pulse bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      }`}
    >
      {display}
    </div>
  );
}
