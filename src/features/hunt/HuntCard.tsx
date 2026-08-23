import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { useCountdown } from '@/features/kitchen/hooks/useCountdown';
import { cn, formatMMSS } from '@/lib/utils';
import type { Hunt } from '@/models/player';

interface HuntCardProps {
  hunt: Hunt;
  onRegister: (huntId: string) => void;
}

const STATUS_LABEL: Record<Hunt['status'], string> = {
  travelling: 'En route',
  hunting: 'À la chasse',
  returning: 'Retour',
  arrived: 'De retour',
};

/** One hunter's card: a countdown for the travel legs, an action otherwise. */
export const HuntCard = ({ hunt, onRegister }: HuntCardProps) => {
  const { playerName, huntArrived, huntReturned, recallHunter, isRoundRunning } =
    useKitchen();

  const travelling = hunt.status === 'travelling';
  const returning = hunt.status === 'returning';
  const onLeg = travelling || returning;

  // The two travel legs are plain countdowns; `done` keeps the hook inert
  // while the hunter is waiting at the ground or already home.
  const remaining = useCountdown(
    {
      id: hunt.id,
      endTime: hunt.endTime ?? 0,
      done: !onLeg,
    },
    travelling ? huntArrived : huntReturned,
  );

  const progress =
    hunt.duration > 0 ? (hunt.duration - remaining) / hunt.duration : 1;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-3',
        hunt.status === 'arrived' ? 'border-green-500' : 'border-sky-300',
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-base font-bold text-gray-900">
          {playerName(hunt.workerId)}
        </p>
        <p className="shrink-0 text-xs font-semibold text-sky-700">
          {STATUS_LABEL[hunt.status]}
        </p>
      </div>

      {onLeg && (
        <>
          <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
            {formatMMSS(remaining)}
          </p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </>
      )}

      {hunt.status === 'hunting' && (
        <button
          type="button"
          onClick={() => recallHunter(hunt.id)}
          disabled={!isRoundRunning}
          className="mt-2 min-h-11 w-full rounded-xl bg-sky-600 text-sm font-bold text-white active:bg-sky-700 disabled:bg-gray-300"
        >
          Rappeler
        </button>
      )}

      {hunt.status === 'arrived' && (
        <button
          type="button"
          onClick={() => onRegister(hunt.id)}
          disabled={!isRoundRunning}
          className="mt-2 min-h-11 w-full rounded-xl bg-green-600 text-sm font-bold text-white active:bg-green-700 disabled:bg-gray-300"
        >
          Enregistrer la chasse
        </button>
      )}
    </div>
  );
};
