import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { useCountdown } from '@/features/kitchen/hooks/useCountdown';
import { cn } from '@/lib/utils';
import type { ActiveTimer } from '@/models/food';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

interface TimerProps {
  timer: ActiveTimer;
  /** Label of the button shown once the countdown finishes. */
  actionLabel: string;
  onAction: (id: string) => void;
}

export const Timer = ({ timer, actionLabel, onAction }: TimerProps) => {
  const { markDone } = useKitchen();
  const remaining = useCountdown(timer, markDone);
  const done = timer.done || remaining <= 0;
  const progress =
    timer.duration > 0 ? (timer.duration - remaining) / timer.duration : 1;
  const isPrepare = timer.stage === 'prepare';

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-xl border bg-white/95 p-2 shadow-md backdrop-blur',
        done
          ? 'border-green-500'
          : isPrepare
            ? 'border-amber-300'
            : 'border-rose-300',
      )}
    >
      <p className="truncate text-xs font-semibold text-gray-700">
        {timer.foodName}
      </p>
      {done ? (
        <button
          type="button"
          onClick={() => onAction(timer.id)}
          className="mt-1 min-h-9 w-full rounded-lg bg-green-600 px-2 text-xs font-bold text-white active:bg-green-700"
        >
          {actionLabel}
        </button>
      ) : (
        <>
          <p className="text-lg font-bold tabular-nums text-gray-900">
            {formatTime(remaining)}
          </p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full',
                isPrepare ? 'bg-amber-500' : 'bg-rose-500',
              )}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
};
