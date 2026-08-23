import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { useCountdown } from '@/features/kitchen/hooks/useCountdown';
import { cn, formatMMSS } from '@/lib/utils';

interface RoundBarProps {
  onOpenSettings: () => void;
}

/** Full-width top bar: settings gear, the main "day" countdown, and start. */
export const RoundBar = ({ onOpenSettings }: RoundBarProps) => {
  const {
    round,
    day,
    settings,
    players,
    availableWorkers,
    isRoundRunning,
    startRound,
    endRound,
  } = useKitchen();
  const remaining = useCountdown(
    { id: 'round', endTime: round.endTime ?? 0, done: !isRoundRunning },
    endRound,
  );
  const low = isRoundRunning && remaining <= 30;

  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3">
      <button
        type="button"
        onClick={onOpenSettings}
        disabled={isRoundRunning}
        aria-label="Paramètres"
        className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-gray-600 disabled:opacity-30 active:bg-gray-100"
      >
        ⚙
      </button>

      <div className="flex flex-col items-center leading-none">
        {isRoundRunning ? (
          <span
            className={cn(
              'text-3xl font-black tabular-nums',
              low ? 'text-red-600' : 'text-gray-900',
            )}
          >
            {formatMMSS(remaining)}
          </span>
        ) : (
          <>
            <span className="text-xs font-semibold uppercase text-gray-400">
              Journée {day}
            </span>
            <span className="text-xl font-black text-gray-900">
              {settings.roundMinutes} min
            </span>
          </>
        )}
      </div>

      {isRoundRunning ? (
        <span className="min-w-11 rounded-full bg-gray-100 px-2 py-1 text-center text-xs font-bold tabular-nums text-gray-700">
          {availableWorkers.length}/{players.length} dispo
        </span>
      ) : (
        <button
          type="button"
          onClick={startRound}
          className="min-h-11 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white active:bg-emerald-700"
        >
          Démarrer
        </button>
      )}
    </div>
  );
};
