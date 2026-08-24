import { useState } from 'react';
import { findMonster, MONSTERS } from '@/data/monsters';
import { sortRewards } from '@/data/rewards';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';
import type { Monster, Recipe, RewardId } from '@/models/monster';
import { MonsterList } from './MonsterList';
import { RecipeList } from './RecipeList';
import { RewardFilter } from './RewardFilter';

interface StageViewProps {
  stage: Stage;
}

/**
 * Reusable stage screen: pick a monster, then one of its recipes, then start.
 * The `stage` prop drives what is available (carcasses vs prepared dishes),
 * which of the recipe's two durations applies, and where the timer docks.
 */
export const StageView = ({ stage }: StageViewProps) => {
  const {
    stageRecipes,
    availableWorkers,
    canPrepare,
    canCook,
    isRoundRunning,
    startPrepare,
    startCook,
  } = useKitchen();
  const [monsterId, setMonsterId] = useState<string | null>(null);
  const [rewardId, setRewardId] = useState<RewardId | null>(null);

  const isPrepare = stage === 'prepare';
  const accent = isPrepare ? 'prepare' : 'cook';

  // A recipe is startable here only at the matching progress state and only
  // when no timer already holds it, so both grids come from one selector,
  // narrowed by the reward filter.
  const recipesFor = (monster: Monster) => {
    const startable = stageRecipes(monster.id, stage);
    return rewardId
      ? startable.filter((item) => item.reward === rewardId)
      : startable;
  };

  const monsters = MONSTERS.filter((monster) => recipesFor(monster).length > 0);

  // The chips offer only rewards that exist at this stage, unfiltered, so
  // clearing the filter is always one tap away.
  const offeredRewards = sortRewards(
    MONSTERS.flatMap((monster) =>
      stageRecipes(monster.id, stage).map((item) => item.reward),
    ),
  );

  const monster = monsterId ? findMonster(monsterId) : undefined;
  const recipes: Recipe[] = monster ? recipesFor(monster) : [];

  const slotBlocked = isPrepare && !canPrepare;
  const noWorker = isPrepare ? !canPrepare : !canCook;
  const blocked = slotBlocked || noWorker || !isRoundRunning;

  const back = () => {
    setMonsterId(null);
  };

  const handlePick = (recipe: Recipe) => {
    if (!monster) return;
    if (isPrepare) startPrepare(monster.id, recipe.id);
    else startCook(monster.id, recipe.id);
    back();
  };

  const blockedMessage = () => {
    if (!isRoundRunning) return 'Démarrez la journée pour cuisiner.';
    if (availableWorkers.length === 0) return 'Aucun ouvrier disponible.';
    if (!isPrepare) return null;
    // Prepare is also capped by the number of tables the player owns.
    if (!canPrepare) return 'Table de préparation occupée.';
    return null;
  };

  const message = blockedMessage();

  return (
    <div className="flex h-full flex-col gap-4">
      {monster && (
        <button
          type="button"
          onClick={back}
          className="flex min-h-11 shrink-0 items-center gap-1 self-start rounded-xl px-2 text-sm font-bold text-gray-600 active:bg-gray-100"
        >
          <span aria-hidden="true">‹</span> {monster.name}
        </button>
      )}

      {offeredRewards.length > 0 && (
        <RewardFilter
          rewards={offeredRewards}
          value={rewardId}
          onChange={setRewardId}
        />
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {monster ? (
          <RecipeList
            recipes={recipes}
            stage={stage}
            accent={accent}
            disabled={blocked}
            onSelect={handlePick}
            emptyLabel="Aucune recette disponible"
          />
        ) : (
          <MonsterList
            monsters={monsters}
            countOf={(item) => recipesFor(item).length}
            rewardsOf={(item) =>
              sortRewards(recipesFor(item).map((entry) => entry.reward))
            }
            selectedId={monsterId}
            accent={accent}
            onSelect={setMonsterId}
            emptyLabel={
              isPrepare
                ? 'Aucune carcasse — envoyez un chasseur'
                : 'Aucun plat prêt à cuisiner'
            }
          />
        )}
      </div>

      {message && (
        <p
          className={cn(
            'shrink-0 text-center text-sm',
            isRoundRunning ? 'text-amber-700' : 'text-gray-500',
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
};
