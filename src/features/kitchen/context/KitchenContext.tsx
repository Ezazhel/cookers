import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
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
import type { ActiveTimer, Carcass, Stage } from '@/models/food';
import type { Recipe } from '@/models/monster';
import type { Hunt, Player } from '@/models/player';

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
}

interface GameState {
  phase: AppPhase;
  players: Player[];
  /** Carcasses in stock — at most one per monster. */
  carcasses: Carcass[];
  activeTimers: ActiveTimer[];
  hunts: Hunt[];
  round: RoundState;
  settings: GameSettings;
}

type GameAction =
  | { type: 'OPEN_SETUP' }
  | { type: 'START_GAME'; players: Player[] }
  | { type: 'START_TIMER'; stage: Stage; monsterId: string; recipeId: string }
  | { type: 'MARK_DONE'; id: string }
  | { type: 'FINISH_PREPARE'; id: string }
  | { type: 'SERVE_DISH'; id: string }
  | { type: 'START_HUNT'; workerId: string }
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
  | { type: 'SET_HUNT_RETURN_SECONDS'; seconds: number };

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
  settings: {
    roundMinutes: ROUND_DEFAULT_MINUTES,
    prepareSlots: PREPARE_SLOTS_DEFAULT,
    huntTravelSeconds: HUNT_TRAVEL_SECONDS_DEFAULT,
    huntReturnSeconds: HUNT_RETURN_SECONDS_DEFAULT,
  },
};

/** Actions that only make sense while a day is running. The UI disables them
 *  too; this is the authoritative guard. */
const inRoundActions: GameAction['type'][] = [
  'START_TIMER',
  'FINISH_PREPARE',
  'SERVE_DISH',
  'START_HUNT',
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
      const recipe = findRecipe(timer.monsterId, timer.recipeId);
      // cookSeconds 0 means no cook step: skip straight to served instead of
      // surfacing the recipe in Cuisiner.
      const next = recipe?.cookSeconds === 0 ? 'cook' : 'prepare';
      return {
        ...state,
        carcasses: withRecipeState(state, timer.monsterId, timer.recipeId, next),
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
      };
    }

    case 'SERVE_DISH': {
      const timer = state.activeTimers.find((t) => t.id === action.id);
      if (!timer) return state;
      return {
        ...state,
        carcasses: withRecipeState(
          state,
          timer.monsterId,
          timer.recipeId,
          'cook',
        ),
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
      };
      return { ...state, hunts: [...state.hunts, hunt] };
    }

    case 'HUNT_ARRIVED': {
      return {
        ...state,
        hunts: state.hunts.map((hunt) =>
          hunt.id === action.id && hunt.status === 'travelling'
            ? { ...hunt, status: 'hunting', endTime: null }
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
      };
    }

    case 'START_ROUND': {
      // A new day: clear the board but keep the players and what they hunted.
      return {
        ...state,
        activeTimers: [],
        hunts: [],
        round: {
          status: 'running',
          endTime:
            Date.now() + state.settings.roundMinutes * SECONDS_PER_MINUTE * 1000,
        },
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
  settings: GameSettings;
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
  startHunt: (workerId: string) => void;
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

  const startHunt = useCallback((workerId: string) => {
    dispatch({ type: 'START_HUNT', workerId });
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
      settings: state.settings,
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
      startHunt,
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
    startHunt,
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
