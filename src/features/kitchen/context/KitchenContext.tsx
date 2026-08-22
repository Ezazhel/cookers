import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  PREPARE_SLOTS,
  ROUND_DEFAULT_MINUTES,
  ROUND_MIN_MINUTES,
  SECONDS_PER_MINUTE,
  SECONDS_PER_UNIT,
} from '@/config';
import { Food, type ActiveTimer, type Stage } from '@/models/food';

/** Lifecycle of a round ("day"): not started, in progress, or over. */
export type RoundStatus = 'idle' | 'running' | 'ended';

interface RoundState {
  status: RoundStatus;
  durationMinutes: number;
  /** Epoch ms when the round ends, or null while idle/ended. */
  endTime: number | null;
}

interface KitchenState {
  /** Prepared items waiting to be cooked (all have `type: 'cook'`). */
  inventory: Food[];
  activeTimers: ActiveTimer[];
  round: RoundState;
}

type KitchenAction =
  | { type: 'START_TIMER'; stage: Stage; foodName: string; units: number }
  | { type: 'MARK_DONE'; id: string }
  | { type: 'REGISTER_TO_INVENTORY'; id: string }
  | { type: 'REMOVE_TIMER'; id: string }
  | { type: 'CONSUME_INVENTORY'; foodId: string }
  | { type: 'START_ROUND' }
  | { type: 'END_ROUND' }
  | { type: 'RESET_ROUND' }
  | { type: 'SET_ROUND_DURATION'; minutes: number };

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${(counter += 1)}`;

const preparingCount = (timers: ActiveTimer[]) =>
  timers.filter((t) => t.stage === 'prepare').length;

const reducer = (state: KitchenState, action: KitchenAction): KitchenState => {
  // Kitchen actions are only allowed while a round is running (UI also
  // disables them; this is the authoritative guard).
  const kitchenActions = [
    'START_TIMER',
    'REGISTER_TO_INVENTORY',
    'REMOVE_TIMER',
    'CONSUME_INVENTORY',
  ];
  if (
    state.round.status !== 'running' &&
    kitchenActions.includes(action.type)
  ) {
    return state;
  }

  switch (action.type) {
    case 'START_TIMER': {
      // A prepare "table" is occupied until its item is registered, even once
      // the countdown is done, so guard against exceeding the owned slots.
      if (
        action.stage === 'prepare' &&
        preparingCount(state.activeTimers) >= PREPARE_SLOTS
      ) {
        return state;
      }
      const timer: ActiveTimer = {
        id: nextId('timer'),
        foodName: action.foodName,
        stage: action.stage,
        duration: action.units * SECONDS_PER_UNIT,
        endTime: Date.now() + action.units * SECONDS_PER_UNIT * 1000,
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

    case 'REGISTER_TO_INVENTORY': {
      const timer = state.activeTimers.find((t) => t.id === action.id);
      if (!timer) return state;
      const prepared = new Food(nextId('food'), timer.foodName, 'cook');
      return {
        ...state,
        inventory: [...state.inventory, prepared],
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
      };
    }

    case 'REMOVE_TIMER': {
      return {
        ...state,
        activeTimers: state.activeTimers.filter((t) => t.id !== action.id),
      };
    }

    case 'CONSUME_INVENTORY': {
      return {
        ...state,
        inventory: state.inventory.filter((f) => f.id !== action.foodId),
      };
    }

    case 'START_ROUND': {
      // A new day: wipe the kitchen and start a fresh main timer.
      return {
        inventory: [],
        activeTimers: [],
        round: {
          status: 'running',
          durationMinutes: state.round.durationMinutes,
          endTime:
            Date.now() +
            state.round.durationMinutes * SECONDS_PER_MINUTE * 1000,
        },
      };
    }

    case 'END_ROUND': {
      // Time's up: freeze the kitchen (timers/inventory stay for display).
      return {
        ...state,
        round: { ...state.round, status: 'ended', endTime: null },
      };
    }

    case 'RESET_ROUND': {
      // Back to the initial screen: wipe the kitchen, keep the chosen duration.
      return {
        inventory: [],
        activeTimers: [],
        round: {
          status: 'idle',
          durationMinutes: state.round.durationMinutes,
          endTime: null,
        },
      };
    }

    case 'SET_ROUND_DURATION': {
      if (state.round.status === 'running') return state;
      return {
        ...state,
        round: {
          ...state.round,
          durationMinutes: Math.max(ROUND_MIN_MINUTES, action.minutes),
        },
      };
    }

    default:
      return state;
  }
};

interface KitchenContextValue {
  inventory: Food[];
  activeTimers: ActiveTimer[];
  round: RoundState;
  /** Whether the round is currently running (kitchen unlocked). */
  isRoundRunning: boolean;
  /** Whether a new prepare timer can be started (a free prepare table). */
  canPrepare: boolean;
  startPrepare: (foodName: string, units: number) => void;
  /** Starts cooking a prepared inventory item (consuming it from inventory). */
  startCook: (food: Food, units: number) => void;
  markDone: (id: string) => void;
  registerToInventory: (id: string) => void;
  removeTimer: (id: string) => void;
  /** Starts (or restarts, for a new day) the round's main timer. */
  startRound: () => void;
  endRound: () => void;
  /** Clears the kitchen and returns to the initial idle screen. */
  resetRound: () => void;
  setRoundDuration: (minutes: number) => void;
}

const KitchenContext = createContext<KitchenContextValue | null>(null);

export const KitchenProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    inventory: [],
    activeTimers: [],
    round: {
      status: 'idle',
      durationMinutes: ROUND_DEFAULT_MINUTES,
      endTime: null,
    },
  });

  const startPrepare = useCallback((foodName: string, units: number) => {
    dispatch({ type: 'START_TIMER', stage: 'prepare', foodName, units });
  }, []);

  const startCook = useCallback((food: Food, units: number) => {
    dispatch({ type: 'CONSUME_INVENTORY', foodId: food.id });
    dispatch({ type: 'START_TIMER', stage: 'cook', foodName: food.name, units });
  }, []);

  const markDone = useCallback((id: string) => {
    dispatch({ type: 'MARK_DONE', id });
  }, []);

  const registerToInventory = useCallback((id: string) => {
    dispatch({ type: 'REGISTER_TO_INVENTORY', id });
  }, []);

  const removeTimer = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TIMER', id });
  }, []);

  const startRound = useCallback(() => {
    dispatch({ type: 'START_ROUND' });
  }, []);

  const endRound = useCallback(() => {
    dispatch({ type: 'END_ROUND' });
  }, []);

  const resetRound = useCallback(() => {
    dispatch({ type: 'RESET_ROUND' });
  }, []);

  const setRoundDuration = useCallback((minutes: number) => {
    dispatch({ type: 'SET_ROUND_DURATION', minutes });
  }, []);

  const value = useMemo<KitchenContextValue>(
    () => ({
      inventory: state.inventory,
      activeTimers: state.activeTimers,
      round: state.round,
      isRoundRunning: state.round.status === 'running',
      canPrepare: preparingCount(state.activeTimers) < PREPARE_SLOTS,
      startPrepare,
      startCook,
      markDone,
      registerToInventory,
      removeTimer,
      startRound,
      endRound,
      resetRound,
      setRoundDuration,
    }),
    [
      state.inventory,
      state.activeTimers,
      state.round,
      startPrepare,
      startCook,
      markDone,
      registerToInventory,
      removeTimer,
      startRound,
      endRound,
      resetRound,
      setRoundDuration,
    ],
  );

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
