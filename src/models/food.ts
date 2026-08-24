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

/** What a Frigo entry protects: a whole raw carcass, or one individually
 *  prepared-but-uncooked item. The two are always separate, decoupled
 *  tokens even for the same monster. */
export type FrigoEntryKind = 'carcass' | 'prepared';

/**
 * One thing sitting in the shared Frigo. Purely a tracking/aging overlay —
 * it never duplicates the underlying `Carcass`/`RecipeState` data, it just
 * marks a (monsterId[, recipeId]) pair as "protected" and remembers which
 * shelf it's on.
 */
export interface FrigoEntry {
  id: string;
  kind: FrigoEntryKind;
  monsterId: string;
  /** Present only for `kind: 'prepared'` — identifies which recipe. A
   *  `'carcass'` entry has no `recipeId`: it protects every recipe of that
   *  monster currently in `'nothing'` state, as a set. */
  recipeId?: string;
  /** 1 = top/freshest shelf. Bumped by 1 every `START_ROUND` day transition;
   *  an entry whose shelf would exceed `frigoShelves` spoils and is removed. */
  shelf: number;
}
