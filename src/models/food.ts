import type { RecipeState } from './monster';

export type Stage = 'prepare' | 'cook';

/**
 * A single monster carcass in stock. Monsters are unique — you can only ever
 * hold one Orc — so `monsterId` is the identity. One carcass feeds every
 * recipe of its monster, each tracked separately.
 */
export interface Carcass {
  monsterId: string;
  /** Progress per recipe id; every recipe of the monster has an entry. */
  recipes: Record<string, RecipeState>;
}

/** A running (or finished) countdown shown in a corner tray. */
export interface ActiveTimer {
  id: string;
  /** Which tray the timer lives in: `prepare` = top-left, `cook` = top-right. */
  stage: Stage;
  monsterId: string;
  recipeId: string;
  /** The player occupied by this task until it is dismissed. */
  workerId: string;
  /** Total duration in real seconds, taken from the recipe. */
  duration: number;
  /** Epoch ms when the countdown reaches zero. */
  endTime: number;
  /** Set once the countdown hits zero and awaits the user's action. */
  done: boolean;
}
