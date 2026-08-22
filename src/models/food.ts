/** A food's stage in the pipeline: raw ingredient to prepare, or a prepared
 *  item ready to cook. The value flips `prepare` -> `cook` once registered. */
export type Stage = 'prepare' | 'cook';

/**
 * A food item. `type` tracks where it sits in the pipeline:
 * - `prepare`: a raw ingredient from the catalog, waiting to be prepared.
 * - `cook`: a prepared item sitting in inventory, ready to be cooked.
 *
 * Note: fields are declared and assigned explicitly (not via constructor
 * parameter properties) because tsconfig has `erasableSyntaxOnly` enabled.
 */
export class Food {
  id: string;
  name: string;
  type: Stage;

  constructor(id: string, name: string, type: Stage) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

/** A running (or finished) countdown shown in a corner tray. */
export interface ActiveTimer {
  id: string;
  foodName: string;
  /** Which tray the timer lives in: `prepare` = top-left, `cook` = top-right. */
  stage: Stage;
  /** Total duration in real seconds. */
  duration: number;
  /** Epoch ms when the countdown reaches zero. */
  endTime: number;
  /** Set once the countdown hits zero and awaits the user's action. */
  done: boolean;
}
