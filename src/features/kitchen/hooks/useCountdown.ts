import { useEffect, useState } from 'react';
import type { ActiveTimer } from '@/models/food';

const remainingSeconds = (endTime: number) =>
  Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

/**
 * Timestamp-based countdown: derives remaining seconds from `endTime` on each
 * tick so it never drifts across re-renders or throttled tabs. Calls
 * `onComplete` once the timer reaches zero (unless already marked done).
 */
export const useCountdown = (
  timer: ActiveTimer,
  onComplete: (id: string) => void,
) => {
  const [remaining, setRemaining] = useState(() =>
    remainingSeconds(timer.endTime),
  );

  useEffect(() => {
    if (timer.done) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const value = remainingSeconds(timer.endTime);
      setRemaining(value);
      if (value <= 0) onComplete(timer.id);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timer.id, timer.endTime, timer.done, onComplete]);

  return remaining;
};
