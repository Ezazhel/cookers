import type { Monster, Recipe } from '@/models/monster';

/**
 * TODO: replace with the real board-game data. These monsters and recipes are
 * placeholders with plausible timings; only Orc / Saucisse (20 s prepare,
 * 15 s cook) is taken from the rules.
 */
export const MONSTERS: readonly Monster[] = [
  {
    id: 'orc',
    name: 'Orc',
    recipes: [
      {
        id: 'orc-saucisse',
        name: 'Saucisse',
        reward: 'Viande mijotée tendre',
        prepareSeconds: 20,
        cookSeconds: 15,
      },
      {
        id: 'orc-brochette',
        name: 'Brochette',
        reward: 'Viande rouge tendre',
        prepareSeconds: 25,
        cookSeconds: 20,
      },
      {
        id: 'orc-ragout',
        name: 'Ragoût',
        reward: 'Viande rouge mijotée',
        prepareSeconds: 30,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'gobelin',
    name: 'Gobelin',
    recipes: [
      {
        id: 'gobelin-pate',
        name: 'Pâté',
        reward: 'Viande blanche mijotée',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
      {
        id: 'gobelin-filet',
        name: 'Filet',
        reward: 'Viande blanche tendre',
        prepareSeconds: 20,
        cookSeconds: 15,
      },
      {
        id: 'gobelin-bouillon',
        name: 'Bouillon',
        reward: 'Accompagnement',
        prepareSeconds: 15,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'troll',
    name: 'Troll',
    recipes: [
      {
        id: 'troll-rotie',
        name: 'Rôtie',
        reward: 'Viande rouge tendre',
        prepareSeconds: 30,
        cookSeconds: 30,
      },
      {
        id: 'troll-terrine',
        name: 'Terrine',
        reward: 'Viande rouge mijotée',
        prepareSeconds: 25,
        cookSeconds: 30,
      },
      {
        id: 'troll-garniture',
        name: 'Garniture',
        reward: 'Légumes',
        prepareSeconds: 20,
        cookSeconds: 20,
      },
    ],
  },
  {
    id: 'sanglier',
    name: 'Sanglier',
    recipes: [
      {
        id: 'sanglier-jambon',
        name: 'Jambon',
        reward: 'Viande rouge tendre',
        prepareSeconds: 25,
        cookSeconds: 15,
      },
      {
        id: 'sanglier-lardons',
        name: 'Lardons',
        reward: 'Topping',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
      {
        id: 'sanglier-civet',
        name: 'Civet',
        reward: 'Viande rouge mijotée',
        prepareSeconds: 30,
        cookSeconds: 20,
      },
    ],
  },
];

export const findMonster = (monsterId: string): Monster | undefined =>
  MONSTERS.find((monster) => monster.id === monsterId);

export const findRecipe = (
  monsterId: string,
  recipeId: string,
): Recipe | undefined =>
  findMonster(monsterId)?.recipes.find((recipe) => recipe.id === recipeId);

/** Seconds this recipe takes at the given stage. */
export const recipeSeconds = (recipe: Recipe, stage: 'prepare' | 'cook') =>
  stage === 'prepare' ? recipe.prepareSeconds : recipe.cookSeconds;
