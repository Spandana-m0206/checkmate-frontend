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
          ? "bg-surface-sunken text-content-subtle"
          : urgent
            ? "animate-pulse bg-danger/20 text-danger-hover"
            : "bg-surface-sunken text-content"
      }`}
    >
      {display}
    </div>
  );
}
