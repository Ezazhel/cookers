import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  FRIGO_SHELVES_DEFAULT,
  FRIGO_SHELVES_MIN,
  FRIGO_SLOTS_DEFAULT,
  FRIGO_SLOTS_MIN,
  HUNT_RETURN_SECONDS_DEFAULT,
  HUNT_SECONDS_MIN,
  HUNT_TRAVEL_SECONDS_DEFAULT,
  PREPARE_SLOTS_DEFAULT,
  PREPARE_SLOTS_MIN,
  ROUND_DEFAULT_MINUTES,
  ROUND_MIN_MINUTES,
  SECONDS_PER_MINUTE,
} from '@/config';
import { findMonster, findRecipe, recipeSeconds } from '@/data/monsters';
import type { ActiveTimer, Carcass, FrigoEntry, Stage } from '@/models/food';
import type { Recipe } from '@/models/monster';
import type { Hunt, Player } from '@/models/player';
import { emptyRoundStats, type RoundStats } from '@/models/stats';

/** Which screen the app is on: title, game setup, or the board itself. */
export type AppPhase = 'home' | 'setup' | 'playing';

/** Lifecycle of a round ("day"): not started, in progress, or over. */
export type RoundStatus = 'idle' | 'running' | 'ended';

interface RoundState {
  status: RoundStatus;
  /** Epoch ms when the round ends, or null while idle/ended. */
  endTime: number | null;
}

interface GameSettings {
  roundMinutes: number;
  prepareSlots: number;
  huntTravelSeconds: number;
  huntReturnSeconds: number;
  frigoSlots: number;
  frigoShelves: number;
}

interface GameState {
  phase: AppPhase;
  players: Player[];
  /** Carcasses in stock — at most one per monster. */
  carcasses: Carcass[];
  activeTimers: ActiveTimer[];
  hunts: Hunt[];
  round: RoundState;
  /** Which day the players are on. Starts at 1, +1 each time a new day is
   *  started from the end-of-day screen. */
  day: number;
  settings: GameSettings;
  /** What happened this round, for the end-of-day recap. Cleared when the
   *  next round starts. */
  stats: RoundStats;
  /** What's preserved in the shared Frigo across the day boundary. */
  frigo: FrigoEntry[];
}

type GameAction =
  | { type: 'OPEN_SETUP' }
  | { type: 'START_GAME'; players: Player[] }
  | { type: 'START_TIMER'; stage: Stage; monsterId: string; recipeId: string }
  | { type: 'MARK_DONE'; id: string }
  | { type: 'FINISH_PREPARE'; id: string }
  | { type: 'SERVE_DISH'; id: string }
  | { type: 'BURN_DISH'; id: string }
  | { type: 'CANCEL_TIMER'; id: string }
  | { type: 'START_HUNT'; workerId: string }
  | { type: 'CANCEL_HUNT'; id: string }
  | { type: 'HUNT_ARRIVED'; id: string }
  | { type: 'RECALL_HUNTER'; id: string }
  | { type: 'HUNT_RETURNED'; id: string }
  | { type: 'REGISTER_LOOT'; huntId: string; monsterIds: string[] }
  | { type: 'START_ROUND' }
  | { type: 'END_ROUND' }
  | { type: 'RESET_ROUND' }
  | { type: 'SET_ROUND_DURATION'; minutes: number }
  | { type: 'SET_PREPARE_SLOTS'; slots: number }
  | { type: 'SET_HUNT_TRAVEL_SECONDS'; seconds: number }
  | { type: 'SET_HUNT_RETURN_SECONDS'; seconds: number }
  | {
      type: 'STORE_IN_FRIGO';
      carcassMonsterIds: string[];
      preparedItems: { monsterId: string; recipeId: string }[];
    }
  | { type: 'SET_FRIGO_SLOTS'; slots: number }
  | { type: 'SET_FRIGO_SHELVES'; shelves: number };

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${(counter += 1)}`;

const preparingCount = (timers: ActiveTimer[]) =>
  timers.filter((t) => t.stage === 'prepare').length;

const findCarcass = (state: GameState, monsterId: string) =>
  state.carcasses.find((carcass) => carcass.monsterId === monsterId);

/** Progress of one recipe. A missing carcass reads as `cook`: nothing to do. */
const recipeState = (state: GameState, monsterId: string, recipeId: string) =>
  findCarcass(state, monsterId)?.recipes[recipeId] ?? 'cook';

/** A recipe with a running timer is off both lists until it is dismissed. */
const isRecipeBusy = (state: GameState, monsterId: string, recipeId: string) =>
  state.activeTimers.some(
    (timer) => timer.monsterId === monsterId && timer.recipeId === recipeId,
  );

/** Recipes of a monster that can be started at this stage right now: the ones
 *  at the matching progress state and not already on a timer. Drives both the
 *  recipe grid and the monster badge, so the two can never disagree. */
const availableRecipes = (
  state: GameState,
  monsterId: string,
  stage: Stage,
): Recipe[] => {
  const monster = findMonster(monsterId);
  if (!monster || !findCarcass(state, monsterId)) return [];
  const wanted = stage === 'prepare' ? 'nothing' : 'prepare';
  return monster.recipes.filter(
    (recipe) =>
      recipeState(state, monsterId, recipe.id) === wanted &&
      !isRecipeBusy(state, monsterId, recipe.id),
  );
};

/** Sets one recipe's progress, dropping the carcass once it is fully served. */
const withRecipeState = (
  state: GameState,
  monsterId: string,
  recipeId: string,
  next: 'prepare' | 'cook',
): Carcass[] =>
  state.carcasses.flatMap((carcass) => {
    if (carcass.monsterId !== monsterId) return [carcass];
    const recipes = { ...carcass.recipes, [recipeId]: next };
    // A carcass whose every recipe has been served is used up and disappears,
    // which makes that monster huntable again.
    const spent = Object.values(recipes).every((value) => value === 'cook');
    return spent ? [] : [{ ...carcass, recipes }];
  });

/** Whether a Frigo entry is still doing its job: a `'carcass'` entry is
 *  valid while its carcass still has at least one un-prepared recipe, a
 *  `'prepared'` entry is valid while its specific recipe is still sitting
 *  in `'prepare'`. Anything else means the entry is stale. */
const frigoEntryStillValid = (state: GameState, entry: FrigoEntry): boolean => {
  const carcass = findCarcass(state, entry.monsterId);
  if (!carcass) return false;
  if (entry.kind === 'carcass') {
    return Object.values(carcass.recipes).some((value) => value === 'nothing');
  }
  return (
    entry.recipeId !== undefined && carcass.recipes[entry.recipeId] === 'prepare'
  );
};

/** Drops stale Frigo entries against `state.carcasses` as it stands right
 *  now. Call this right after any `withRecipeState` call that can move a
 *  protected recipe out of the state its Frigo entry expects — this is the
 *  whole mechanism behind a stored item "disappearing naturally" once it is
 *  actually used through the normal prepare/cook/serve flow. */
const pruneFrigo = (state: GameState): FrigoEntry[] =>
  state.frigo.filter((entry) => frigoEntryStillValid(state, entry));

/** Carcasses with at least one still-raw recipe not already covered by an
 *  existing `'carcass'` Frigo entry — what the end-of-day picker offers. */
const storableCarcasses = (state: GameState): Carcass[] =>
  state.carcasses.filter(
    (carcass) =>
      Object.values(carcass.recipes).some((value) => value === 'nothing') &&
      !state.frigo.some(
        (entry) => entry.kind === 'carcass' && entry.monsterId === carcass.monsterId,
      ),
  );

/** Individually-prepared (recipe state `'prepare'`) items not already
 *  covered by an existing `'prepared'` Frigo entry for that exact
 *  monster+recipe — what the end-of-day picker offers. */
const storablePreparedItems = (
  state: GameState,
): { monsterId: string; recipeId: string }[] =>
  state.carcasses.flatMap((carcass) =>
    Object.entries(carcass.recipes)
      .filter(
        ([recipeId, value]) =>
          value === 'prepare' &&
          !state.frigo.some(
            (entry) =>
              entry.kind === 'prepared' &&
              entry.monsterId === carcass.monsterId &&
              entry.recipeId === recipeId,
          ),
      )
      .map(([recipeId]) => ({ monsterId: carcass.monsterId, recipeId })),
  );

/** Slot cost of a set of Frigo entries: one whole-carcass entry uses a full
 *  slot, two prepared entries share one slot. */
const frigoSlotsUsed = (entries: FrigoEntry[]): number => {
  const carcassCount = entries.filter((entry) => entry.kind === 'carcass').length;
  const preparedCount = entries.filter((entry) => entry.kind === 'prepared').length;
  return carcassCount + Math.ceil(preparedCount / 2);
};

/** Every player currently tied up by a timer or a hunt. A hunt holds its
 *  worker through every status, including `arrived`, until the loot is
 *  registered. */
const busyWorkerIds = (state: GameState) =>
  new Set([
    ...state.activeTimers.map((t) => t.workerId),
    ...state.hunts.map((h) => h.workerId),
  ]);

const idleWorkers = (state: GameState) => {
  const busy = busyWorkerIds(state);
  return state.players.filter((player) => !busy.has(player.id));
};

const initialState: GameState = {
  phase: 'home',
  players: [],
  carcasses: [],
  activeTimers: [],
  hunts: [],
  round: { status: 'idle', endTime: null },
  day: 1,
  stats: emptyRoundStats(),
  frigo: [],
  settings: {
    roundMinutes: ROUND_DEFAULT_MINUTES,
    prepareSlots: PREPARE_SLOTS_DEFAULT,
    huntTravelSeconds: HUNT_TRAVEL_SECONDS_DEFAULT,
    huntReturnSeconds: HUNT_RETURN_SECONDS_DEFAULT,
    frigoSlots: FRIGO_SLOTS_DEFAULT,
    frigoShelves: FRIGO_SHELVES_DEFAULT,
  },
};

/** Actions that only make sense while a day is running. The UI disables them
 *  too; this is the authoritative guard. */
const inRoundActions: GameAction['type'][] = [
  'START_TIMER',
  'FINISH_PREPARE',
  'SERVE_DISH',
  'BURN_DISH',
  'CANCEL_TIMER',
  'START_HUNT',
  'CANCEL_HUNT',
  'HUNT_ARRIVED',
  'RECALL_HUNTER',
  'HUNT_RETURNED',
  'REGISTER_LOOT',
];

const reducer = (state: GameState, action: GameAction): GameState => {
  if (state.round.status !== 'running' && inRoundActions.includes(action.type)) {
    return state;
  }

  switch (action.type) {
    case 'OPEN_SETUP': {
      return { ...initialState, phase: 'setup', settings: state.settings };
    }

    case 'START_GAME': {
      return {
        ...initialState,
        phase: 'playing',
        players: action.players,
        settings: state.settings,
      };
    }

    case 'START_TIMER': {
      const recipe = findRecipe(action.monsterId, action.recipeId);
      if (!recipe) return state;

      // Every task occupies one worker until it is dismissed.
      const worker = idleWorkers(state)[0];
      if (!worker) return state;

      const isPrepare = action.stage === 'prepare';
      // A prepare "table" stays occupied until its item is registered, even
      // once the countdown is done, so guard against exceeding owned tables.
      if (
        isPrepare &&
        preparingCount(state.activeTimers) >= state.settings.prepareSlots
      ) {
        return state;
      }

      // The carcass is not consumed here: progress only advances when the
      // timer is dismissed, and the running timer itself keeps the recipe off
      // both lists in the meantime.
      const startable = availableRecipes(state, action.monsterId, action.stage);
      if (!startable.some((item) => item.id === action.recipeId)) return state;

      const duration = recipeSeconds(recipe, action.stage);
      const timer: ActiveTimer = {
        id: nextId('timer'),
        stage: action.stage,
        monsterId: action.monsterId,
        recipeId: action.recipeId,
        workerId: worker.id,
        duration,
        endTime: Date.now() + duration * 1000,
        done: false,
      };
      return { ...state, activeTimers: [...state.activeTimers, timer] };
    }

    case 'MARK_DONE': {
      return {
        ...state,
        activeTimers: state.activeTimers.map((t) =>
          t.id === action.id ? { ...t, done: true } : t,
        ),
      };
    }

    case 'FINISH_PREPARE': {
      const timer = state.activeTimers.find((t) => t.id === action.id);
      if (!timer) return state;
      // Always lands in `prepare`, no-cook recipes included: the dish must
      // pass through Cuisiner so the player can choose to serve it right
      // away (an instant, 0-duration cook timer) or leave it prepared,
      // eligible for Frigo storage instead.
      const nextState: GameState = {
        ...state,
        carcasses: withRecipeState(state, timer.monsterId, timer.recipeId, 'prepare'),
      };
      return {
        ...nextState,
        frigo: pruneFrigo(nextState),
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
        stats: {
          ...state.stats,
          prepared: [
            ...state.stats.prepared,
            {
              monsterId: timer.monsterId,
              recipeId: timer.recipeId,
              seconds: timer.duration,
            },
          ],
        },
      };
    }

    case 'SERVE_DISH': {
      const timer = state.activeTimers.find((t) => t.id === action.id);
      if (!timer) return state;
      const nextState: GameState = {
        ...state,
        carcasses: withRecipeState(state, timer.monsterId, timer.recipeId, 'cook'),
      };
      return {
        ...nextState,
        frigo: pruneFrigo(nextState),
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
        stats: {
          ...state.stats,
          cooked: [
            ...state.stats.cooked,
            { monsterId: timer.monsterId, recipeId: timer.recipeId, burnt: false },
          ],
        },
      };
    }

    case 'BURN_DISH': {
      // A cooked dish left unserved past the burn window: same terminal
      // transition as SERVE_DISH, just logged as burnt instead of served.
      const timer = state.activeTimers.find((t) => t.id === action.id);
      if (!timer) return state;
      const nextState: GameState = {
        ...state,
        carcasses: withRecipeState(state, timer.monsterId, timer.recipeId, 'cook'),
      };
      return {
        ...nextState,
        frigo: pruneFrigo(nextState),
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
        stats: {
          ...state.stats,
          cooked: [
            ...state.stats.cooked,
            { monsterId: timer.monsterId, recipeId: timer.recipeId, burnt: true },
          ],
        },
      };
    }

    case 'CANCEL_TIMER': {
      // Drops the timer without touching carcass state: START_TIMER never
      // mutated it, so there is nothing to roll back. Removing it from
      // activeTimers frees the worker (and the table, if it was a prepare
      // timer) immediately.
      return {
        ...state,
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
      };
    }

    case 'START_HUNT': {
      const worker = state.players.find((p) => p.id === action.workerId);
      if (!worker || busyWorkerIds(state).has(worker.id)) return state;
      const duration = state.settings.huntTravelSeconds;
      const hunt: Hunt = {
        id: nextId('hunt'),
        workerId: worker.id,
        status: 'travelling',
        duration,
        endTime: Date.now() + duration * 1000,
        huntingSince: null,
        dungeonSeconds: null,
      };
      return { ...state, hunts: [...state.hunts, hunt] };
    }

    case 'CANCEL_HUNT': {
      // Undoes a misclick: only while the hunter is still travelling out,
      // before they've actually reached the dungeon. Once `hunting`, coming
      // back is the in-fiction `RECALL_HUNTER` journey instead.
      return {
        ...state,
        hunts: state.hunts.filter(
          (hunt) => !(hunt.id === action.id && hunt.status === 'travelling'),
        ),
      };
    }

    case 'HUNT_ARRIVED': {
      return {
        ...state,
        hunts: state.hunts.map((hunt) =>
          hunt.id === action.id && hunt.status === 'travelling'
            ? {
                ...hunt,
                status: 'hunting',
                endTime: null,
                huntingSince: Date.now(),
              }
            : hunt,
        ),
      };
    }

    case 'RECALL_HUNTER': {
      const duration = state.settings.huntReturnSeconds;
      return {
        ...state,
        hunts: state.hunts.map((hunt) =>
          hunt.id === action.id && hunt.status === 'hunting'
            ? {
                ...hunt,
                status: 'returning',
                duration,
                endTime: Date.now() + duration * 1000,
                dungeonSeconds: hunt.huntingSince
                  ? Math.round((Date.now() - hunt.huntingSince) / 1000)
                  : 0,
              }
            : hunt,
        ),
      };
    }

    case 'HUNT_RETURNED': {
      return {
        ...state,
        hunts: state.hunts.map((hunt) =>
          hunt.id === action.id && hunt.status === 'returning'
            ? { ...hunt, status: 'arrived', endTime: null }
            : hunt,
        ),
      };
    }

    case 'REGISTER_LOOT': {
      const hunt = state.hunts.find((h) => h.id === action.huntId);
      if (!hunt || hunt.status !== 'arrived') return state;
      // Carcasses are unique: a monster already in stock cannot be brought
      // back a second time (the modal disables it too).
      const caught = action.monsterIds
        .filter((monsterId) => !findCarcass(state, monsterId))
        .map((monsterId) => findMonster(monsterId))
        .filter((monster) => monster !== undefined)
        .map<Carcass>((monster) => ({
          monsterId: monster.id,
          recipes: Object.fromEntries(
            monster.recipes.map((recipe) => [recipe.id, 'nothing' as const]),
          ),
        }));
      return {
        ...state,
        carcasses: [...state.carcasses, ...caught],
        hunts: state.hunts.filter((h) => h.id !== action.huntId),
        stats: {
          ...state.stats,
          hunts: [
            ...state.stats.hunts,
            {
              id: nextId('huntlog'),
              monsterIds: caught.map((carcass) => carcass.monsterId),
              dungeonSeconds: hunt.dungeonSeconds ?? 0,
            },
          ],
        },
      };
    }

    case 'START_ROUND': {
      // A new day: clear the board but keep the players and what they
      // hunted. Only bump the day counter (and age the Frigo) when this
      // follows an ended day, not the very first "Démarrer" from idle.
      const isNewDay = state.round.status === 'ended';
      let carcasses = state.carcasses;
      let frigo = state.frigo;

      if (isNewDay) {
        // Every Frigo entry ages one shelf. Anything that would fall off
        // the bottom shelf spoils: it's dropped and its protected recipe(s)
        // are marked lost via the normal terminal transition, which also
        // frees the monster to be hunted again if that was its last recipe.
        const aged = state.frigo.map((entry) => ({ ...entry, shelf: entry.shelf + 1 }));
        const kept: FrigoEntry[] = [];
        let working: GameState = { ...state, carcasses };

        for (const entry of aged) {
          if (entry.shelf <= state.settings.frigoShelves) {
            kept.push(entry);
            continue;
          }
          const carcass = findCarcass(working, entry.monsterId);
          const lostRecipeIds =
            entry.kind === 'carcass'
              ? Object.entries(carcass?.recipes ?? {})
                  .filter(([, value]) => value === 'nothing')
                  .map(([recipeId]) => recipeId)
              : entry.recipeId
                ? [entry.recipeId]
                : [];
          for (const recipeId of lostRecipeIds) {
            working = {
              ...working,
              carcasses: withRecipeState(working, entry.monsterId, recipeId, 'cook'),
            };
          }
        }

        carcasses = working.carcasses;
        frigo = kept;
      }

      return {
        ...state,
        carcasses,
        frigo,
        activeTimers: [],
        hunts: [],
        stats: emptyRoundStats(),
        round: {
          status: 'running',
          endTime:
            Date.now() + state.settings.roundMinutes * SECONDS_PER_MINUTE * 1000,
        },
        day: isNewDay ? state.day + 1 : state.day,
      };
    }

    case 'END_ROUND': {
      // Time's up: freeze the board (timers and stock stay on display).
      return { ...state, round: { status: 'ended', endTime: null } };
    }

    case 'RESET_ROUND': {
      // End of the game: back to the title screen, keeping only the settings.
      return { ...initialState, settings: state.settings };
    }

    case 'SET_ROUND_DURATION': {
      if (state.round.status === 'running') return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          roundMinutes: Math.max(ROUND_MIN_MINUTES, action.minutes),
        },
      };
    }

    case 'SET_PREPARE_SLOTS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          prepareSlots: Math.max(PREPARE_SLOTS_MIN, action.slots),
        },
      };
    }

    case 'SET_HUNT_TRAVEL_SECONDS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          huntTravelSeconds: Math.max(HUNT_SECONDS_MIN, action.seconds),
        },
      };
    }

    case 'SET_HUNT_RETURN_SECONDS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          huntReturnSeconds: Math.max(HUNT_SECONDS_MIN, action.seconds),
        },
      };
    }

    case 'STORE_IN_FRIGO': {
      // Only meaningful between rounds, when the picker is actually shown.
      if (state.round.status !== 'ended') return state;

      const okCarcasses = storableCarcasses(state).map((c) => c.monsterId);
      const okPrepared = storablePreparedItems(state);
      const pickedCarcasses = action.carcassMonsterIds.filter((id) =>
        okCarcasses.includes(id),
      );
      const pickedPrepared = action.preparedItems.filter((item) =>
        okPrepared.some(
          (o) => o.monsterId === item.monsterId && o.recipeId === item.recipeId,
        ),
      );

      // Defensive re-clamp to remaining capacity: the UI already disables
      // over-capacity picks, this just guarantees the invariant regardless.
      let remaining = state.settings.frigoSlots - frigoSlotsUsed(state.frigo);
      const acceptedCarcasses: string[] = [];
      for (const id of pickedCarcasses) {
        if (remaining <= 0) break;
        acceptedCarcasses.push(id);
        remaining -= 1;
      }
      const acceptedPrepared: { monsterId: string; recipeId: string }[] = [];
      let halfOpenSlot = false;
      for (const item of pickedPrepared) {
        if (halfOpenSlot) {
          acceptedPrepared.push(item);
          halfOpenSlot = false;
          continue;
        }
        if (remaining <= 0) break;
        acceptedPrepared.push(item);
        remaining -= 1;
        halfOpenSlot = true;
      }

      const newEntries: FrigoEntry[] = [
        ...acceptedCarcasses.map<FrigoEntry>((monsterId) => ({
          id: nextId('frigo'),
          kind: 'carcass',
          monsterId,
          shelf: 1,
        })),
        ...acceptedPrepared.map<FrigoEntry>(({ monsterId, recipeId }) => ({
          id: nextId('frigo'),
          kind: 'prepared',
          monsterId,
          recipeId,
          shelf: 1,
        })),
      ];

      // Finalize the day: anything still `nothing`/`prepare` that isn't
      // freshly stored (or already protected by an existing entry) is lost
      // — the Frigo is the only way to carry stock across the day boundary.
      let working: GameState = state;
      for (const carcass of state.carcasses) {
        for (const [recipeId, value] of Object.entries(carcass.recipes)) {
          if (value === 'cook') continue;
          const protectedNow =
            (value === 'nothing' &&
              (acceptedCarcasses.includes(carcass.monsterId) ||
                state.frigo.some(
                  (e) => e.kind === 'carcass' && e.monsterId === carcass.monsterId,
                ))) ||
            (value === 'prepare' &&
              (acceptedPrepared.some(
                (p) => p.monsterId === carcass.monsterId && p.recipeId === recipeId,
              ) ||
                state.frigo.some(
                  (e) =>
                    e.kind === 'prepared' &&
                    e.monsterId === carcass.monsterId &&
                    e.recipeId === recipeId,
                )));
          if (protectedNow) continue;
          working = {
            ...working,
            carcasses: withRecipeState(working, carcass.monsterId, recipeId, 'cook'),
          };
        }
      }

      return { ...working, frigo: [...state.frigo, ...newEntries] };
    }

    case 'SET_FRIGO_SLOTS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          frigoSlots: Math.max(FRIGO_SLOTS_MIN, action.slots),
        },
      };
    }

    case 'SET_FRIGO_SHELVES': {
      return {
        ...state,
        settings: {
          ...state.settings,
          frigoShelves: Math.max(FRIGO_SHELVES_MIN, action.shelves),
        },
      };
    }

    default:
      return state;
  }
};

interface KitchenContextValue {
  phase: AppPhase;
  players: Player[];
  carcasses: Carcass[];
  activeTimers: ActiveTimer[];
  hunts: Hunt[];
  round: RoundState;
  day: number;
  settings: GameSettings;
  stats: RoundStats;
  frigo: FrigoEntry[];
  /** Total Frigo slots currently occupied by `frigo`. */
  frigoSlotsUsed: number;
  /** Carcasses/items the end-of-day picker can offer right now. */
  storableCarcasses: Carcass[];
  storablePreparedItems: { monsterId: string; recipeId: string }[];
  /** Whether the round is currently running (the board is unlocked). */
  isRoundRunning: boolean;
  /** Players not tied up by a timer or a hunt. */
  availableWorkers: Player[];
  /** Whether a new prepare timer can be started (free worker + free table). */
  canPrepare: boolean;
  /** Whether a new cook timer can be started (free worker). */
  canCook: boolean;
  /** Whether another hunter can be sent out (free worker). */
  canHunt: boolean;
  playerName: (workerId: string) => string;
  /** Monsters already in stock — they cannot be hunted again. */
  ownedMonsterIds: Set<string>;
  /** Recipes of a monster that can be started at this stage right now. */
  stageRecipes: (monsterId: string, stage: Stage) => Recipe[];
  openSetup: () => void;
  startGame: (players: Player[]) => void;
  startPrepare: (monsterId: string, recipeId: string) => void;
  startCook: (monsterId: string, recipeId: string) => void;
  markDone: (id: string) => void;
  /** Files a finished prepare timer away: the recipe moves to Cuisiner. */
  finishPrepare: (id: string) => void;
  /** Serves a finished cook timer, using up the carcass if it was the last. */
  serveDish: (id: string) => void;
  /** Burns an unserved cook timer past its serve window: same terminal
   *  effect as serveDish, logged separately for the recap. */
  burnDish: (id: string) => void;
  /** Cancels an in-progress timer, freeing its worker (and table) again. */
  cancelTimer: (id: string) => void;
  startHunt: (workerId: string) => void;
  /** Cancels a hunt while its worker is still travelling out (misclick undo). */
  cancelHunt: (id: string) => void;
  huntArrived: (id: string) => void;
  recallHunter: (id: string) => void;
  huntReturned: (id: string) => void;
  registerLoot: (huntId: string, monsterIds: string[]) => void;
  /** Starts (or restarts, for a new day) the round's main timer. */
  startRound: () => void;
  endRound: () => void;
  /** Ends the game and returns to the title screen. */
  resetRound: () => void;
  setRoundDuration: (minutes: number) => void;
  setPrepareSlots: (slots: number) => void;
  setHuntTravelSeconds: (seconds: number) => void;
  setHuntReturnSeconds: (seconds: number) => void;
  /** Stores the chosen carcasses/prepared items in the Frigo and finalizes
   *  the day: everything else still raw or prepared is lost. */
  storeInFrigo: (
    carcassMonsterIds: string[],
    preparedItems: { monsterId: string; recipeId: string }[],
  ) => void;
  setFrigoSlots: (slots: number) => void;
  setFrigoShelves: (shelves: number) => void;
}

const KitchenContext = createContext<KitchenContextValue | null>(null);

export const KitchenProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openSetup = useCallback(() => dispatch({ type: 'OPEN_SETUP' }), []);

  const startGame = useCallback((players: Player[]) => {
    dispatch({ type: 'START_GAME', players });
  }, []);

  const startPrepare = useCallback((monsterId: string, recipeId: string) => {
    dispatch({ type: 'START_TIMER', stage: 'prepare', monsterId, recipeId });
  }, []);

  const startCook = useCallback((monsterId: string, recipeId: string) => {
    dispatch({ type: 'START_TIMER', stage: 'cook', monsterId, recipeId });
  }, []);

  const markDone = useCallback((id: string) => {
    dispatch({ type: 'MARK_DONE', id });
  }, []);

  const finishPrepare = useCallback((id: string) => {
    dispatch({ type: 'FINISH_PREPARE', id });
  }, []);

  const serveDish = useCallback((id: string) => {
    dispatch({ type: 'SERVE_DISH', id });
  }, []);

  const burnDish = useCallback((id: string) => {
    dispatch({ type: 'BURN_DISH', id });
  }, []);

  const cancelTimer = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_TIMER', id });
  }, []);

  const startHunt = useCallback((workerId: string) => {
    dispatch({ type: 'START_HUNT', workerId });
  }, []);

  const cancelHunt = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_HUNT', id });
  }, []);

  const huntArrived = useCallback((id: string) => {
    dispatch({ type: 'HUNT_ARRIVED', id });
  }, []);

  const recallHunter = useCallback((id: string) => {
    dispatch({ type: 'RECALL_HUNTER', id });
  }, []);

  const huntReturned = useCallback((id: string) => {
    dispatch({ type: 'HUNT_RETURNED', id });
  }, []);

  const registerLoot = useCallback((huntId: string, monsterIds: string[]) => {
    dispatch({ type: 'REGISTER_LOOT', huntId, monsterIds });
  }, []);

  const startRound = useCallback(() => dispatch({ type: 'START_ROUND' }), []);
  const endRound = useCallback(() => dispatch({ type: 'END_ROUND' }), []);
  const resetRound = useCallback(() => dispatch({ type: 'RESET_ROUND' }), []);

  const setRoundDuration = useCallback((minutes: number) => {
    dispatch({ type: 'SET_ROUND_DURATION', minutes });
  }, []);

  const setPrepareSlots = useCallback((slots: number) => {
    dispatch({ type: 'SET_PREPARE_SLOTS', slots });
  }, []);

  const setHuntTravelSeconds = useCallback((seconds: number) => {
    dispatch({ type: 'SET_HUNT_TRAVEL_SECONDS', seconds });
  }, []);

  const setHuntReturnSeconds = useCallback((seconds: number) => {
    dispatch({ type: 'SET_HUNT_RETURN_SECONDS', seconds });
  }, []);

  const storeInFrigo = useCallback(
    (
      carcassMonsterIds: string[],
      preparedItems: { monsterId: string; recipeId: string }[],
    ) => {
      dispatch({ type: 'STORE_IN_FRIGO', carcassMonsterIds, preparedItems });
    },
    [],
  );

  const setFrigoSlots = useCallback((slots: number) => {
    dispatch({ type: 'SET_FRIGO_SLOTS', slots });
  }, []);

  const setFrigoShelves = useCallback((shelves: number) => {
    dispatch({ type: 'SET_FRIGO_SHELVES', shelves });
  }, []);

  const value = useMemo<KitchenContextValue>(() => {
    const available = idleWorkers(state);
    const hasWorker = available.length > 0;
    return {
      phase: state.phase,
      players: state.players,
      carcasses: state.carcasses,
      activeTimers: state.activeTimers,
      hunts: state.hunts,
      round: state.round,
      day: state.day,
      settings: state.settings,
      stats: state.stats,
      frigo: state.frigo,
      frigoSlotsUsed: frigoSlotsUsed(state.frigo),
      storableCarcasses: storableCarcasses(state),
      storablePreparedItems: storablePreparedItems(state),
      isRoundRunning: state.round.status === 'running',
      availableWorkers: available,
      canPrepare:
        hasWorker &&
        preparingCount(state.activeTimers) < state.settings.prepareSlots,
      canCook: hasWorker,
      canHunt: hasWorker,
      playerName: (workerId: string) =>
        state.players.find((p) => p.id === workerId)?.name ?? '',
      ownedMonsterIds: new Set(state.carcasses.map((c) => c.monsterId)),
      stageRecipes: (monsterId: string, stage: Stage) =>
        availableRecipes(state, monsterId, stage),
      openSetup,
      startGame,
      startPrepare,
      startCook,
      markDone,
      finishPrepare,
      serveDish,
      burnDish,
      cancelTimer,
      startHunt,
      cancelHunt,
      huntArrived,
      recallHunter,
      huntReturned,
      registerLoot,
      startRound,
      endRound,
      resetRound,
      setRoundDuration,
      setPrepareSlots,
      setHuntTravelSeconds,
      setHuntReturnSeconds,
      storeInFrigo,
      setFrigoSlots,
      setFrigoShelves,
    };
  }, [
    state,
    openSetup,
    startGame,
    startPrepare,
    startCook,
    markDone,
    finishPrepare,
    serveDish,
    burnDish,
    cancelTimer,
    startHunt,
    cancelHunt,
    huntArrived,
    recallHunter,
    huntReturned,
    registerLoot,
    startRound,
    endRound,
    resetRound,
    setRoundDuration,
    setPrepareSlots,
    setHuntTravelSeconds,
    setHuntReturnSeconds,
    storeInFrigo,
    setFrigoSlots,
    setFrigoShelves,
  ]);

  return (
    <KitchenContext.Provider value={value}>{children}</KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const ctx = useContext(KitchenContext);
  if (!ctx) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return ctx;
};
