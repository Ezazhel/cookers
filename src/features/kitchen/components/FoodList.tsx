import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';

export interface FoodListItem {
  id: string;
  name: string;
}

interface FoodListProps {
  /** Only affects accent styling — the same list serves both stages. */
  type: Stage;
  items: FoodListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyLabel?: string;
}

export const FoodList = ({
  type,
  items,
  selectedId,
  onSelect,
  emptyLabel,
}: FoodListProps) => {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400">
        {emptyLabel ?? 'Rien ici pour le moment'}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex min-h-14 w-full items-center rounded-xl border px-4 text-left text-base font-medium transition',
                selected
                  ? type === 'prepare'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-rose-500 bg-rose-50 text-rose-900'
                  : 'border-gray-200 bg-white text-gray-800 active:bg-gray-50',
              )}
            >
              {item.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
