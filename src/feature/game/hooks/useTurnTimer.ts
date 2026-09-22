import { useState, useEffect, useRef } from "react";
import { TURN_TIMEOUT_MS } from "../../../utils/constants";

interface UseTurnTimerOptions {
  turnStartedAt: number | null;
  isActive: boolean;
  onTimeout: () => void;
}

export function useTurnTimer({
  turnStartedAt,
  isActive,
  onTimeout,
}: UseTurnTimerOptions) {
  const [remaining, setRemaining] = useState(TURN_TIMEOUT_MS);
  const timeoutFired = useRef(false);

  useEffect(() => {
    timeoutFired.current = false;
  }, [turnStartedAt]);

  useEffect(() => {
    if (!isActive || turnStartedAt == null) {
      setRemaining(TURN_TIMEOUT_MS);
      return;
    }

    function tick() {
      const elapsed = Date.now() - turnStartedAt!;
      const left = Math.max(0, TURN_TIMEOUT_MS - elapsed);
      setRemaining(left);

      if (left <= 0 && !timeoutFired.current) {
        timeoutFired.current = true;
        onTimeout();
      }
    }

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [turnStartedAt, isActive, onTimeout]);

  const seconds = Math.ceil(remaining / 1000);

  return { remaining, seconds };
}
