import type { Monster, Recipe } from '@/models/monster';

/**
 * TODO: replace with the real board-game data. These monsters and recipes are
 * placeholders with plausible timings; only Orc / Saucisse (20 s prepare,
 * 15 s cook) is taken from the rules. Rewards are typed, so a wrong one is a
 * build error rather than a filter that silently matches nothing.
 */
export const MONSTERS: readonly Monster[] = [
  {
    id: 'orc',
    name: 'Orc',
    recipes: [
      {
        id: 'orc-saucisse',
        name: 'Saucisse',
        reward: 'viande-rouge-tendre',
        prepareSeconds: 20,
        cookSeconds: 15,
      },
      {
        id: 'orc-brochette',
        name: 'Brochette',
        reward: 'viande-rouge-tendre',
        prepareSeconds: 25,
        cookSeconds: 20,
      },
      {
        id: 'orc-ragout',
        name: 'Ragoût',
        reward: 'viande-rouge-mijotee',
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
        reward: 'viande-blanche-mijotee',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
      {
        id: 'gobelin-filet',
        name: 'Filet',
        reward: 'viande-blanche-tendre',
        prepareSeconds: 20,
        cookSeconds: 15,
      },
      {
        id: 'gobelin-bouillon',
        name: 'Bouillon',
        reward: 'accompagnement',
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
        reward: 'viande-rouge-tendre',
        prepareSeconds: 30,
        cookSeconds: 30,
      },
      {
        id: 'troll-terrine',
        name: 'Terrine',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 25,
        cookSeconds: 30,
      },
      {
        id: 'troll-garniture',
        name: 'Garniture',
        reward: 'legumes',
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
        reward: 'viande-rouge-tendre',
        prepareSeconds: 25,
        cookSeconds: 15,
      },
      {
        id: 'sanglier-lardons',
        name: 'Lardons',
        reward: 'topping',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
      {
        id: 'sanglier-civet',
        name: 'Civet',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 30,
        cookSeconds: 20,
      },
    ],
  },
  {
    id: 'licorne',
    name: 'Licorne',
    recipes: [
      {
        id: 'licorne-steak',
        name: 'Steak à la licorne',
        reward: 'viande-rouge-tendre',
        prepareSeconds: 20,
        cookSeconds: 10,
      },
      {
        id: 'licorne-corne',
        name: 'Corne parfaite',
        reward: 'topping',
        prepareSeconds: 25,
        // No cook step: served as soon as it's prepared.
        cookSeconds: 0,
      },
      {
        id: 'licorne-bourguicorne',
        name: 'Bourguicorne',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 15,
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
