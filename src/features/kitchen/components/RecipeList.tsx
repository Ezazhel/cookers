import { CardGrid, SelectCard, type Accent } from '@/components/CardGrid';
import { recipeSeconds } from '@/data/monsters';
import type { Stage } from '@/models/food';
import type { Recipe } from '@/models/monster';

interface RecipeListProps {
  recipes: Recipe[];
  stage: Stage;
  selectedId: string | null;
  accent: Accent;
  onSelect: (recipeId: string) => void;
  emptyLabel: string;
}

export const RecipeList = ({
  recipes,
  stage,
  selectedId,
  accent,
  onSelect,
  emptyLabel,
}: RecipeListProps) => {
  if (recipes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <CardGrid>
      {recipes.map((recipe) => (
        <SelectCard
          key={recipe.id}
          label={recipe.name}
          hint={`${recipeSeconds(recipe, stage)} s`}
          rewards={[recipe.reward]}
          selected={recipe.id === selectedId}
          accent={accent}
          onSelect={() => onSelect(recipe.id)}
        />
      ))}
    </CardGrid>
  );
};
