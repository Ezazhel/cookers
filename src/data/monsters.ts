import type { Monster, Recipe } from '@/models/monster';

/**
 * Real board-game data, transcribed from the official monster/recipe
 * spreadsheet. Rewards are typed, so a wrong one is a build error rather than
 * a filter that silently matches nothing.
 */
export const MONSTERS: readonly Monster[] = [
  {
    id: 'gobelin',
    name: 'Gobelin',
    recipes: [
      {
        id: 'gobelin-mains-paquets',
        name: 'Mains paquets',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 10,
        cookSeconds: 20,
      },
      {
        id: 'gobelin-cuisse',
        name: 'Cuisse à gobé',
        reward: 'viande-rouge-tendre',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
      {
        id: 'gobelin-oreille-frite',
        name: 'Oreille frite',
        reward: 'accompagnement',
        prepareSeconds: 10,
        cookSeconds: 10,
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
  {
    id: 'sirene',
    name: 'Sirène',
    recipes: [
      {
        id: 'sirene-queue-frite',
        name: 'Queue de sirène frite',
        reward: 'poissons',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
      {
        id: 'sirene-salade-cheveux',
        name: 'Salade de cheveux',
        reward: 'legumes',
        prepareSeconds: 5,
        cookSeconds: 10,
      },
      {
        id: 'sirene-bouillahausse',
        name: "Bouilla'hausse",
        reward: 'sauce-claire',
        prepareSeconds: 10,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'kappa',
    name: 'Kappa',
    recipes: [
      {
        id: 'kappa-assiette-coupole',
        name: 'Assiette coupole de Kappa',
        reward: 'topping',
        prepareSeconds: 25,
        // No cook step: served as soon as it's prepared.
        cookSeconds: 0,
      },
      {
        id: 'kappa-cap-ou-pas',
        name: 'Cap ou pas ? (épicé)',
        reward: 'poissons',
        prepareSeconds: 10,
        cookSeconds: 15,
      },
      {
        id: 'kappa-reduction-carapace',
        name: 'Réduction de carapace',
        reward: 'sauce-corsee',
        prepareSeconds: 15,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'salamandre',
    name: 'Salamandre',
    recipes: [
      {
        id: 'salamandre-sauce-viande',
        name: 'Sauce de viande',
        reward: 'sauce-corsee',
        prepareSeconds: 15,
        cookSeconds: 20,
      },
      {
        id: 'salamandre-brochette-flamme',
        name: 'Brochette à la flamme',
        reward: 'viande-blanche-tendre',
        prepareSeconds: 15,
        cookSeconds: 10,
      },
      {
        id: 'salamandre-pattes-lezard',
        name: 'Pattes de lézard braisé',
        reward: 'viande-blanche-mijotee',
        prepareSeconds: 5,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'liane-etrangleuse',
    name: 'Liane étrangleuse',
    recipes: [
      {
        id: 'liane-etrangleuse-spaghetti',
        name: 'Liane Spaghetti',
        reward: 'accompagnement',
        prepareSeconds: 10,
        cookSeconds: 5,
      },
      {
        id: 'liane-etrangleuse-asperges',
        name: 'Asperges ligotées',
        reward: 'legumes',
        prepareSeconds: 5,
        cookSeconds: 5,
      },
      {
        id: 'liane-etrangleuse-bouillon',
        name: 'Bouillon herbacé',
        reward: 'sauce-claire',
        prepareSeconds: 5,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'orc',
    name: 'Orc',
    recipes: [
      {
        id: 'orc-orchetta',
        name: 'Orchetta',
        reward: 'viande-blanche-mijotee',
        prepareSeconds: 15,
        cookSeconds: 20,
      },
      {
        id: 'orc-mignon',
        name: "L'orc mignon",
        reward: 'viande-blanche-tendre',
        prepareSeconds: 15,
        cookSeconds: 10,
      },
      {
        id: 'orc-couenne',
        name: 'Couenne croustillante',
        reward: 'topping',
        prepareSeconds: 15,
        cookSeconds: 10,
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
