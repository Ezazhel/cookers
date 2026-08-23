import { findReward } from '@/data/rewards';
import { cn } from '@/lib/utils';
import type { RewardId } from '@/models/monster';

interface RewardBadgeProps {
  reward: RewardId;
  /** Larger variant for the filter row; cards use the default. */
  size?: 'sm' | 'md';
}

/** Short colour-coded chip for a reward — the full name is its title. */
export const RewardBadge = ({ reward, size = 'sm' }: RewardBadgeProps) => {
  const value = findReward(reward);
  if (!value) return null;

  return (
    <span
      title={value.label}
      aria-label={value.label}
      className={cn(
        'inline-flex shrink-0 items-center rounded-md font-bold',
        value.tone,
        size === 'sm'
          ? 'px-1 py-px text-[0.5625rem] leading-tight'
          : 'px-1.5 py-0.5 text-[0.625rem]',
      )}
    >
      {value.short}
    </span>
  );
};
