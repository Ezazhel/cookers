import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { PREPARE_SLOTS, SECONDS_PER_UNIT } from '@/config';
import { Food, type ActiveTimer, type Stage } from '@/models/food';

interface KitchenState {
  /** Prepared items waiting to be cooked (all have `type: 'cook'`). */
  inventory: Food[];
  activeTimers: ActiveTimer[];
}

type KitchenAction =
  | { type: 'START_TIMER'; stage: Stage; foodName: string; units: number }
  | { type: 'MARK_DONE'; id: string }
  | { type: 'REGISTER_TO_INVENTORY'; id: string }
  | { type: 'REMOVE_TIMER'; id: string }
  | { type: 'CONSUME_INVENTORY'; foodId: string };

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${(counter += 1)}`;

const preparingCount = (timers: ActiveTimer[]) =>
  timers.filter((t) => t.stage === 'prepare').length;

const reducer = (state: KitchenState, action: KitchenAction): KitchenState => {
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

    default:
      return state;
  }
};

interface KitchenContextValue {
  inventory: Food[];
  activeTimers: ActiveTimer[];
  /** Whether a new prepare timer can be started (a free prepare table). */
  canPrepare: boolean;
  startPrepare: (foodName: string, units: number) => void;
  /** Starts cooking a prepared inventory item (consuming it from inventory). */
  startCook: (food: Food, units: number) => void;
  markDone: (id: string) => void;
  registerToInventory: (id: string) => void;
  removeTimer: (id: string) => void;
}

const KitchenContext = createContext<KitchenContextValue | null>(null);

export const KitchenProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    inventory: [],
    activeTimers: [],
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

  const value = useMemo<KitchenContextValue>(
    () => ({
      inventory: state.inventory,
      activeTimers: state.activeTimers,
      canPrepare: preparingCount(state.activeTimers) < PREPARE_SLOTS,
      startPrepare,
      startCook,
      markDone,
      registerToInventory,
      removeTimer,
    }),
    [
      state.inventory,
      state.activeTimers,
      startPrepare,
      startCook,
      markDone,
      registerToInventory,
      removeTimer,
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
