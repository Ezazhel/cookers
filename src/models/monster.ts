/** What a finished dish yields, in the boardgame's terms. */
export type RewardId =
  | 'viande-rouge-mijotee'
  | 'viande-rouge-tendre'
  | 'viande-blanche-mijotee'
  | 'viande-blanche-tendre'
  | 'legumes'
  | 'topping'
  | 'accompagnement';

export interface Reward {
  id: RewardId;
  /** Full name, used in the filter chips and as the badge's title. */
  label: string;
  /** Short code shown on the cards, e.g. 'VR-T'. */
  short: string;
  /** Tailwind classes for the badge, written out in full so the scanner
   *  picks them up. */
  tone: string;
}

/** One dish a monster's carcass can be turned into. Each recipe owns both of
 *  its durations, so there is no global timer picker any more. */
export interface Recipe {
  id: string;
  name: string;
  reward: RewardId;
  prepareSeconds: number;
  cookSeconds: number;
}

export interface Monster {
  id: string;
  name: string;
  recipes: Recipe[];
}

/**
 * Progress of one recipe of a carcass: `nothing` is raw and shows in Préparer,
 * `prepare` is prepared and shows in Cuisiner, `cook` is served and shows
 * nowhere.
 */
export type RecipeState = 'nothing' | 'prepare' | 'cook';
