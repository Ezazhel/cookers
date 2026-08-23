/** Default number of prepare "tables" the player owns (editable in settings). */
export const PREPARE_SLOTS_DEFAULT = 1;
export const PREPARE_SLOTS_MIN = 1;

/** Default length of a round ("day"), in minutes. */
export const ROUND_DEFAULT_MINUTES = 4;

/** Smallest allowed round length, in minutes. */
export const ROUND_MIN_MINUTES = 1;

/**
 * Real seconds per round minute. 60 = a "4" round lasts 4 real minutes.
 * Lower it (e.g. to 1) to test the end-of-day flow quickly.
 */
export const SECONDS_PER_MINUTE = 60;

/** Default time for a hunter to reach the hunting ground, in seconds. */
export const HUNT_TRAVEL_SECONDS_DEFAULT = 30;

/** Default time for a called-back hunter to come home, in seconds. */
export const HUNT_RETURN_SECONDS_DEFAULT = 30;

export const HUNT_SECONDS_MIN = 1;

/** Player-count bounds for the game setup stepper. */
export const PLAYERS_MIN = 1;
export const PLAYERS_MAX = 6;
export const PLAYERS_DEFAULT = 2;
