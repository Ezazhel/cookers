/** Number of prepare "tables" the player owns (only one for now). */
export const PREPARE_SLOTS = 1;

/** Timer durations offered in the picker, in game units (increments of 5). */
export const TIMER_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

/**
 * Real seconds per timer unit. 1 = a "10" timer counts down 10 real seconds.
 * Set to 60 to make the timer values mean minutes instead.
 */
export const SECONDS_PER_UNIT = 1;

/** Default length of a round ("day"), in minutes. */
export const ROUND_DEFAULT_MINUTES = 4;

/** Smallest allowed round length, in minutes. */
export const ROUND_MIN_MINUTES = 1;

/**
 * Real seconds per round minute. 60 = a "4" round lasts 4 real minutes.
 * Lower it (e.g. to 1) to test the end-of-day flow quickly.
 */
export const SECONDS_PER_MINUTE = 60;
