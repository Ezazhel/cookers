import type { Monster, Recipe } from '@/models/monster';

export const MONSTERS: readonly Monster[] = [
  {
    id: 'gobelin',
    name: 'Gobelin',
    recipes: [
      {
        id: 'gobelin-cuisse',
        name: "Cuisse à gobé'lin",
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
        name: 'Steak à licorne',
        reward: 'viande-rouge-tendre',
        prepareSeconds: 20,
        cookSeconds: 10,
      },
      {
        id: 'licorne-bourguicorne',
        name: 'Bourguicorne',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 15,
        cookSeconds: 20,
      },
      {
        id: 'licorne-corne',
        name: 'Corne parfaite',
        reward: 'topping',
        prepareSeconds: 25,
        // No cook step: served as soon as it's prepared.
        cookSeconds: 0,
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
        reward: 'poissons',
        prepareSeconds: 25,
        // No cook step: served as soon as it's prepared.
        cookSeconds: 0,
      },
      {
        id: 'kappa-cap-ou-pas',
        name: 'Cap ou pas ?',
        reward: 'topping',
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
        id: 'salamandre-brochette-flamme',
        name: 'Brochette à la flamme',
        reward: 'viande-blanche-tendre',
        prepareSeconds: 15,
        cookSeconds: 10,
      },
      {
        id: 'salamandre-sauce-viande',
        name: 'Sauce de viande',
        reward: 'sauce-corsee',
        prepareSeconds: 15,
        cookSeconds: 20,
      },
    ],
  },
  {
    id: 'liane-etrangleuse',
    name: 'Liane étranglueuse',
    recipes: [
      {
        id: 'liane-etrangleuse-spaghetti',
        name: 'Liane Spaghetti',
        reward: 'legumes',
        prepareSeconds: 10,
        cookSeconds: 5,
      },
      {
        id: 'liane-etrangleuse-asperges',
        name: 'Asperges ligotées',
        reward: 'accompagnement',
        prepareSeconds: 5,
        cookSeconds: 5,
      },
    ],
  },
  {
    id: 'orc',
    name: 'Orc',
    recipes: [
      {
        id: 'orc-mignon',
        name: "L'orc mignon",
        reward: 'viande-blanche-tendre',
        prepareSeconds: 15,
        cookSeconds: 10,
      },
      {
        id: 'orc-orchetta',
        name: 'Orchetta',
        reward: 'viande-blanche-mijotee',
        prepareSeconds: 15,
        cookSeconds: 20,
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
  {
    id: 'slime',
    name: 'Slime',
    recipes: [
      {
        id: 'slime-coulis-gluant',
        name: 'Coulis gluant',
        reward: 'sauce-claire',
        prepareSeconds: 15,
        cookSeconds: 10,
      },
      {
        id: 'slime-gelee-rigolote',
        name: 'Gelée rigolote',
        reward: 'accompagnement',
        prepareSeconds: 20,
        cookSeconds: 10,
      },
    ],
  },
  {
    id: 'mandragore',
    name: 'Mandragore',
    recipes: [
      {
        id: 'mandragore-feuille-silence',
        name: 'Feuille du silence',
        reward: 'legumes',
        prepareSeconds: 10,
        cookSeconds: 15,
      },
      {
        id: 'mandragore-bouillon-racines',
        name: 'Bouillon de racines',
        reward: 'sauce-claire',
        prepareSeconds: 10,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'piranha-mutant',
    name: 'Piranha mutant',
    recipes: [
      {
        id: 'piranha-mutant-roti',
        name: 'Piranha rôti',
        reward: 'poissons',
        prepareSeconds: 10,
        cookSeconds: 25,
      },
      {
        id: 'piranha-mutant-reduction',
        name: 'Réduction de piranha',
        reward: 'sauce-corsee',
        prepareSeconds: 15,
        cookSeconds: 25,
      },
    ],
  },
  {
    id: 'squelette',
    name: 'Squelette',
    recipes: [
      {
        id: 'squelette-sauce-os',
        name: "Sauce à l'os",
        reward: 'sauce-corsee',
        prepareSeconds: 10,
        cookSeconds: 25,
      },
      {
        id: 'squelette-os-moelle',
        name: 'Os à la moelle',
        reward: 'accompagnement',
        prepareSeconds: 10,
        cookSeconds: 20,
      },
    ],
  },
  {
    id: 'lycan',
    name: 'Lycan',
    recipes: [
      {
        id: 'lycan-tendre-garou',
        name: 'Tendre garou',
        reward: 'viande-rouge-tendre',
        prepareSeconds: 20,
        cookSeconds: 10,
      },
      {
        id: 'lycan-ragouut-garou',
        name: 'Ragouût-Garou',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 10,
        cookSeconds: 30,
      },
      {
        id: 'lycan-sauce-poil',
        name: 'Sauce au poil',
        reward: 'sauce-claire',
        prepareSeconds: 15,
        cookSeconds: 15,
      },
    ],
  },
  {
    id: 'griffon',
    name: 'Griffon',
    recipes: [
      {
        id: 'griffon-supreme',
        name: 'Suprême de griffon',
        reward: 'viande-blanche-tendre',
        prepareSeconds: 20,
        cookSeconds: 15,
      },
      {
        id: 'griffon-griffonnade',
        name: 'Griffonnade mijotée',
        reward: 'viande-blanche-mijotee',
        prepareSeconds: 10,
        cookSeconds: 30,
      },
      {
        id: 'griffon-duvet-soyeux',
        name: 'Duvet soyeux',
        reward: 'topping',
        prepareSeconds: 20,
        cookSeconds: 5,
      },
    ],
  },
  {
    id: 'chimere',
    name: 'Chimère',
    recipes: [
      {
        id: 'chimere-jambon',
        name: 'Jambon chimérique',
        reward: 'viande-blanche-mijotee',
        prepareSeconds: 15,
        cookSeconds: 25,
      },
      {
        id: 'chimere-biere',
        name: 'Chimère à la bière',
        reward: 'viande-rouge-mijotee',
        prepareSeconds: 10,
        cookSeconds: 30,
      },
    ],
  },
  {
    id: 'anguille',
    name: 'Anguille',
    recipes: [
      {
        id: 'anguille-braisee',
        name: 'Anguille braisée',
        reward: 'poissons',
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
