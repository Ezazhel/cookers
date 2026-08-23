import { RewardBadge } from '@/components/RewardBadge';
import { findReward } from '@/data/rewards';
import { cn } from '@/lib/utils';
import type { RewardId } from '@/models/monster';

interface RewardFilterProps {
  /** Rewards actually attainable at this stage right now, so the filter can
   *  never narrow the grid down to nothing. */
  rewards: RewardId[];
  value: RewardId | null;
  onChange: (reward: RewardId | null) => void;
}

const chip =
  'flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition';

/** Single-select reward filter: tap to narrow, tap again (or Tout) to clear. */
export const RewardFilter = ({
  rewards,
  value,
  onChange,
}: RewardFilterProps) => (
  <div className="-mx-4 shrink-0 overflow-x-auto px-4">
    <div className="flex w-max gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          chip,
          value === null
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50',
        )}
      >
        Tout
      </button>

      {rewards.map((reward) => {
        const active = reward === value;
        return (
          <button
            key={reward}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : reward)}
            className={cn(
              chip,
              active
                ? 'border-gray-900 bg-gray-100 text-gray-900'
                : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50',
            )}
          >
            <RewardBadge reward={reward} size="md" />
            {findReward(reward)?.label}
          </button>
        );
      })}
    </div>
  </div>
);
