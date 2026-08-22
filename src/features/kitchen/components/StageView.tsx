import { useState } from 'react';
import { TIMER_OPTIONS } from '@/config';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { CATALOG } from '@/features/kitchen/data';
import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';
import { FoodList, type FoodListItem } from './FoodList';
import { TimerPicker } from './TimerPicker';

interface StageViewProps {
  stage: Stage;
}

/**
 * Reusable stage screen: food list + timer picker + start button. The `stage`
 * prop drives the food source (catalog vs inventory) and where the started
 * timer docks. Prepare and Cook are the same component with different props.
 */
export const StageView = ({ stage }: StageViewProps) => {
  const { inventory, canPrepare, startPrepare, startCook } = useKitchen();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [units, setUnits] = useState<number>(TIMER_OPTIONS[0]);

  const isPrepare = stage === 'prepare';
  const items: FoodListItem[] = isPrepare
    ? CATALOG.map((name) => ({ id: name, name }))
    : inventory.map((food) => ({ id: food.id, name: food.name }));

  const slotBlocked = isPrepare && !canPrepare;
  const canStart = selectedId !== null && !slotBlocked;

  const handleStart = () => {
    if (selectedId === null) return;
    if (isPrepare) {
      // For the catalog, the item id is the food name.
      startPrepare(selectedId, units);
    } else {
      const food = inventory.find((item) => item.id === selectedId);
      if (!food) return;
      startCook(food, units);
    }
    setSelectedId(null);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <FoodList
          type={stage}
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          emptyLabel={isPrepare ? undefined : 'Aucun plat prêt à cuisiner'}
        />
      </div>

      <div className="shrink-0 space-y-3">
        <TimerPicker value={units} onChange={setUnits} />
        {slotBlocked && (
          <p className="text-center text-sm text-amber-700">
            Table de préparation occupée — une seule à la fois.
          </p>
        )}
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className={cn(
            'min-h-14 w-full rounded-xl text-lg font-bold text-white transition',
            canStart
              ? isPrepare
                ? 'bg-amber-500 active:bg-amber-600'
                : 'bg-rose-500 active:bg-rose-600'
              : 'cursor-not-allowed bg-gray-300',
          )}
        >
          Démarrer ({units})
        </button>
      </div>
    </div>
  );
};
