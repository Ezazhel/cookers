/** What happened during one round ("day"), for the end-of-day recap. */
export interface RoundStats {
  hunts: { id: string; monsterIds: string[]; dungeonSeconds: number }[];
  prepared: { monsterId: string; recipeId: string; seconds: number }[];
  cooked: { monsterId: string; recipeId: string; burnt: boolean }[];
}

export const emptyRoundStats = (): RoundStats => ({
  hunts: [],
  prepared: [],
  cooked: [],
});
