import { RewardBadge } from '@/components/RewardBadge';
import { COOK_BURN_SECONDS } from '@/config';
import { findMonster, findRecipe } from '@/data/monsters';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { useCountdown } from '@/features/kitchen/hooks/useCountdown';
import { cn, formatMMSS } from '@/lib/utils';
import type { ActiveTimer } from '@/models/food';

interface CookTimerProps {
  timer: ActiveTimer;
  /** Opens the (shared) cancel-confirmation dialog for this timer. */
  onRequestCancel: (id: string) => void;
}

/**
 * A cook timer, once done, must be served within COOK_BURN_SECONDS or it
 * burns on its own. The burn countdown is independent per timer, so several
 * dishes finishing at once each get their own window.
 */
export const CookTimer = ({ timer, onRequestCancel }: CookTimerProps) => {
  const { markDone, serveDish, burnDish, isRoundRunning } = useKitchen();
  const remaining = useCountdown(timer, markDone);
  const done = timer.done || remaining <= 0;

  // remainingSeconds is derived from `endTime - Date.now()` on every tick, so
  // this reads exactly COOK_BURN_SECONDS the instant the main countdown
  // completes, with no need to coordinate the two hooks.
  const burnRemaining = useCountdown(
    {
      id: `${timer.id}-burn`,
      endTime: timer.endTime + COOK_BURN_SECONDS * 1000,
      done: !isRoundRunning,
    },
    () => burnDish(timer.id),
  );

  const recipe = findRecipe(timer.monsterId, timer.recipeId);
  const monster = findMonster(timer.monsterId);
  const progress =
    timer.duration > 0 ? (timer.duration - remaining) / timer.duration : 1;
  const burnProgress = burnRemaining / COOK_BURN_SECONDS;

  return (
    <div
      className={cn(
        'relative pointer-events-auto rounded-xl border bg-white/95 p-2 shadow-md backdrop-blur',
        done ? 'border-green-500' : 'border-rose-300',
      )}
    >
      {/* Cancel is only offered while cooking is in progress — once done,
       *  the only outcomes are Servir or the dish burning, per the rules. */}
      {isRoundRunning && !done && (
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
      {done ? (
        <>
          <button
            type="button"
            onClick={() => serveDish(timer.id)}
            disabled={!isRoundRunning}
            className="mt-1 min-h-9 w-full rounded-lg bg-green-600 px-2 text-xs font-bold text-white active:bg-green-700 disabled:bg-gray-300"
          >
            Servir
          </button>
          <p className="mt-1 text-center text-[0.625rem] font-semibold text-red-600">
            Cramé dans {formatMMSS(burnRemaining)}
          </p>
          <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-red-500"
              style={{ width: `${Math.min(100, burnProgress * 100)}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-lg font-bold tabular-nums text-gray-900">
            {formatMMSS(remaining)}
          </p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-rose-500"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
};
