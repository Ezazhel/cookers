/** One dish a monster's carcass can be turned into. Each recipe owns both of
 *  its durations, so there is no global timer picker any more. */
export interface Recipe {
  id: string;
  name: string;
  /** What the finished dish yields, in the boardgame's terms. */
  reward: string;
  prepareSeconds: number;
  /** 0 means no cook step: the dish is served as soon as it's prepared. */
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
