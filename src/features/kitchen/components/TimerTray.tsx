import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';
import { Timer } from './Timer';

interface TimerTrayProps {
  stage: Stage;
}

/**
 * Corner container for the active timers of a stage:
 * prepare timers dock top-left, cook timers top-right (stacked, scrollable).
 */
export const TimerTray = ({ stage }: TimerTrayProps) => {
  const { activeTimers, finishPrepare, serveDish } = useKitchen();
  const timers = activeTimers.filter((timer) => timer.stage === stage);
  if (timers.length === 0) return null;

  const isPrepare = stage === 'prepare';
  const actionLabel = isPrepare ? 'Ranger en stock' : 'Servir';
  const onAction = isPrepare ? finishPrepare : serveDish;

  return (
    <div
      className={cn(
        'pointer-events-none fixed top-[4.5rem] z-20 flex max-h-[55vh] w-[42vw] max-w-56 flex-col gap-2 overflow-y-auto',
        isPrepare ? 'left-2 items-start' : 'right-2 items-end',
      )}
    >
      {timers.map((timer) => (
        <div key={timer.id} className="w-full">
          <Timer timer={timer} actionLabel={actionLabel} onAction={onAction} />
        </div>
      ))}
    </div>
  );
};
