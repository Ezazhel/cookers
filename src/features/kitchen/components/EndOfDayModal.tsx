import type { ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { StepperRow } from '@/components/StepperRow';
import { PREPARE_SLOTS_MIN, ROUND_MIN_MINUTES } from '@/config';
import { findMonster, findRecipe } from '@/data/monsters';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { formatMMSS } from '@/lib/utils';

/** Shown when the main timer runs out. Recaps what happened this round, then
 *  lets the players tweak next-day settings (round length, cutting boards) —
 *  the only moment those are editable besides the very first pre-game setup
 *  — before either starting the next day or ending the game outright. */
export const EndOfDayModal = () => {
  const {
    round,
    day,
    settings,
    stats,
    setRoundDuration,
    setPrepareSlots,
    startRound,
    resetRound,
  } = useKitchen();

  return (
    <Modal
      open={round.status === 'ended'}
      title={`Fin de la journée ${day}`}
      dismissible={false}
    >
      <p className="mb-4 text-center text-base text-gray-700">
        Le temps est écoulé. Ajustez les réglages avant de continuer si
        besoin.
      </p>

      <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-1">
        <RecapSection title="Chasse">
          {stats.hunts.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune chasse.</p>
          ) : (
            <ul className="space-y-1">
              {stats.hunts.map((hunt) => (
                <li key={hunt.id} className="text-sm text-gray-700">
                  {hunt.monsterIds.length > 0
                    ? hunt.monsterIds
                        .map((id) => findMonster(id)?.name ?? id)
                        .join(', ')
                    : 'Rien rapporté'}{' '}
                  <span className="text-gray-400">
                    — {formatMMSS(hunt.dungeonSeconds)} en donjon
                  </span>
                </li>
              ))}
            </ul>
          )}
        </RecapSection>

        <RecapSection title="Préparation">
          {stats.prepared.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun plat préparé.</p>
          ) : (
            <ul className="space-y-1">
              {aggregatePrepared(stats.prepared).map((item) => (
                <li
                  key={`${item.monsterId}:${item.recipeId}`}
                  className="text-sm text-gray-700"
                >
                  {findRecipe(item.monsterId, item.recipeId)?.name ??
                    item.recipeId}{' '}
                  <span className="text-gray-400">
                    — {item.count}× · {formatMMSS(item.seconds)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </RecapSection>

        <RecapSection title="Cuisine">
          {stats.cooked.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun plat cuisiné.</p>
          ) : (
            <>
              <ul className="space-y-1">
                {aggregateCooked(stats.cooked).map((item) => (
                  <li
                    key={`${item.monsterId}:${item.recipeId}`}
                    className="text-sm text-gray-700"
                  >
                    {findRecipe(item.monsterId, item.recipeId)?.name ??
                      item.recipeId}{' '}
                    <span className="text-gray-400">
                      — {item.served} servi{item.served > 1 ? 's' : ''}
                      {item.burnt > 0
                        ? ` · ${item.burnt} cramé${item.burnt > 1 ? 's' : ''}`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-semibold text-gray-500">
                {stats.cooked.filter((c) => !c.burnt).length} servis ·{' '}
                {stats.cooked.filter((c) => c.burnt).length} cramés
              </p>
            </>
          )}
        </RecapSection>
      </div>

      <div className="mt-4 space-y-4">
        <StepperRow
          label="Durée de la prochaine journée (min)"
          value={settings.roundMinutes}
          min={ROUND_MIN_MINUTES}
          onChange={setRoundDuration}
        />
        <StepperRow
          label="Planches à découper"
          value={settings.prepareSlots}
          min={PREPARE_SLOTS_MIN}
          onChange={setPrepareSlots}
        />
      </div>

      <button
        type="button"
        onClick={startRound}
        className="mt-6 min-h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
      >
        {`Jour ${day + 1}`}
      </button>
      <button
        type="button"
        onClick={resetRound}
        className="mt-2 min-h-11 w-full rounded-xl text-sm font-bold text-gray-500 active:bg-gray-50"
      >
        Terminer la partie
      </button>
    </Modal>
  );
};

const RecapSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section>
    <h3 className="mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
      {title}
    </h3>
    {children}
  </section>
);

/** Merges repeated (monster, recipe) prepare entries into one row each. */
const aggregatePrepared = (
  entries: { monsterId: string; recipeId: string; seconds: number }[],
) => {
  const byKey = new Map<
    string,
    { monsterId: string; recipeId: string; seconds: number; count: number }
  >();
  for (const entry of entries) {
    const key = `${entry.monsterId}:${entry.recipeId}`;
    const current = byKey.get(key);
    byKey.set(key, {
      monsterId: entry.monsterId,
      recipeId: entry.recipeId,
      seconds: (current?.seconds ?? 0) + entry.seconds,
      count: (current?.count ?? 0) + 1,
    });
  }
  return [...byKey.values()];
};

/** Merges repeated (monster, recipe) cook entries, tallying served/burnt. */
const aggregateCooked = (
  entries: { monsterId: string; recipeId: string; burnt: boolean }[],
) => {
  const byKey = new Map<
    string,
    { monsterId: string; recipeId: string; served: number; burnt: number }
  >();
  for (const entry of entries) {
    const key = `${entry.monsterId}:${entry.recipeId}`;
    const current = byKey.get(key) ?? {
      monsterId: entry.monsterId,
      recipeId: entry.recipeId,
      served: 0,
      burnt: 0,
    };
    byKey.set(key, {
      ...current,
      served: current.served + (entry.burnt ? 0 : 1),
      burnt: current.burnt + (entry.burnt ? 1 : 0),
    });
  }
  return [...byKey.values()];
};
