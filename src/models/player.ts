export interface Player {
  id: string;
  name: string;
}

/**
 * Lifecycle of a hunt: the worker travels to the hunting ground, stays there
 * until called back, travels home, then registers what they caught.
 */
export type HuntStatus = 'travelling' | 'hunting' | 'returning' | 'arrived';

export interface Hunt {
  id: string;
  workerId: string;
  status: HuntStatus;
  /** Epoch ms when the current leg ends; null while hunting/arrived. */
  endTime: number | null;
  /** Total seconds of the current leg, for the progress bar. */
  duration: number;
  /** Epoch ms when this hunt entered `hunting`; null until then. */
  huntingSince: number | null;
  /** Seconds actually spent at `hunting`, frozen at RECALL_HUNTER for the
   *  end-of-day recap. */
  dungeonSeconds: number | null;
}
