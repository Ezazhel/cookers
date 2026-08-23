import { CardGrid, SelectCard, type Accent } from '@/components/CardGrid';
import type { Monster, RewardId } from '@/models/monster';

interface MonsterListProps {
  monsters: readonly Monster[];
  /** Count badge per monster: how many recipes are startable at this stage. */
  countOf: (monster: Monster) => number;
  /** Distinct rewards those recipes can still yield. */
  rewardsOf: (monster: Monster) => RewardId[];
  selectedId: string | null;
  accent: Accent;
  onSelect: (monsterId: string) => void;
  emptyLabel: string;
}

export const MonsterList = ({
  monsters,
  countOf,
  rewardsOf,
  selectedId,
  accent,
  onSelect,
  emptyLabel,
}: MonsterListProps) => {
  if (monsters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <CardGrid>
      {monsters.map((monster) => {
        const count = countOf(monster);
        return (
          <SelectCard
            key={monster.id}
            label={monster.name}
            badge={count}
            rewards={rewardsOf(monster)}
            selected={monster.id === selectedId}
            disabled={count === 0}
            accent={accent}
            onSelect={() => onSelect(monster.id)}
          />
        );
      })}
    </CardGrid>
  );
};
