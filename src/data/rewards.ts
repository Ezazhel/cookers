import type { Reward, RewardId } from '@/models/monster';

/** The rewards a recipe can yield, in catalog order. One hue each so the short
 *  codes stay learnable; none reuse the stage accents (amber = prepare,
 *  rose = cook, sky = hunt). */
export const REWARDS: readonly Reward[] = [
  {
    id: 'viande-rouge-mijotee',
    label: 'Viande rouge mijotée',
    short: 'VR-M',
    tone: 'bg-red-600 text-white',
  },
  {
    id: 'viande-rouge-tendre',
    label: 'Viande rouge tendre',
    short: 'VR-T',
    tone: 'bg-red-400 text-white',
  },
  {
    id: 'viande-blanche-mijotee',
    label: 'Viande blanche mijotée',
    short: 'VB-M',
    tone: 'bg-yellow-600 text-white',
  },
  {
    id: 'viande-blanche-tendre',
    label: 'Viande blanche tendre',
    short: 'VB-T',
    tone: 'bg-yellow-400 text-yellow-950',
  },
  {
    id: 'legumes',
    label: 'Légumes',
    short: 'LÉG',
    tone: 'bg-emerald-500 text-white',
  },
  {
    id: 'topping',
    label: 'Topping',
    short: 'TOP',
    tone: 'bg-violet-500 text-white',
  },
  {
    id: 'accompagnement',
    label: 'Accompagnement',
    short: 'ACC',
    tone: 'bg-slate-500 text-white',
  },
  {
    id: 'poissons',
    label: 'Poissons',
    short: 'POI',
    tone: 'bg-blue-500 text-white',
  },
  {
    id: 'sauce-corsee',
    label: 'Sauce corsée',
    short: 'SA-CO',
    tone: 'bg-orange-600 text-white',
  },
  {
    id: 'sauce-claire',
    label: 'Sauce claire',
    short: 'SA-CL',
    tone: 'bg-orange-400 text-orange-950',
  },
];

export const findReward = (id: RewardId): Reward | undefined =>
  REWARDS.find((reward) => reward.id === id);

/** Distinct reward ids, in catalog order. */
export const sortRewards = (ids: Iterable<RewardId>): RewardId[] => {
  const wanted = new Set(ids);
  return REWARDS.filter((reward) => wanted.has(reward.id)).map((r) => r.id);
};
