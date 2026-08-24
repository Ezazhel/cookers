import { RewardBadge } from '@/components/RewardBadge';
import { findMonster, findRecipe } from '@/data/monsters';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { useCountdown } from '@/features/kitchen/hooks/useCountdown';
import { cn, formatMMSS } from '@/lib/utils';
import type { ActiveTimer } from '@/models/food';

interface PrepareTimerProps {
  timer: ActiveTimer;
  /** Opens the (shared) cancel-confirmation dialog for this timer. */
  onRequestCancel: (id: string) => void;
}

/**
 * A prepare timer needs no "ranger en stock" confirmation: the instant its
 * countdown hits zero, `finishPrepare` fires directly and the timer is gone
 * from the board — there is no "done" state to render.
 */
export const PrepareTimer = ({ timer, onRequestCancel }: PrepareTimerProps) => {
  const { finishPrepare, isRoundRunning } = useKitchen();
  const remaining = useCountdown(timer, finishPrepare);
  const recipe = findRecipe(timer.monsterId, timer.recipeId);
  const monster = findMonster(timer.monsterId);
  const progress =
    timer.duration > 0 ? (timer.duration - remaining) / timer.duration : 1;

  return (
    <div className="relative pointer-events-auto rounded-xl border border-amber-300 bg-white/95 p-2 shadow-md backdrop-blur">
      {isRoundRunning && (
        <button
          type="button"
          aria-label="Annuler"
          onClick={() => onRequestCancel(timer.id)}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-500 shadow active:bg-gray-50"
        >
          ✕
        </button>
      )}

      <p className="truncate text-xs font-semibold text-gray-700">
        {recipe?.name ?? '—'}
      </p>
      <p className="flex items-center gap-1 truncate text-[0.625rem] text-gray-500">
        {recipe && <RewardBadge reward={recipe.reward} />}
        <span className="truncate">{monster?.name}</span>
      </p>
      <p className="text-lg font-bold tabular-nums text-gray-900">
        {formatMMSS(remaining)}
      </p>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn('h-full rounded-full bg-amber-500')}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  );
};
