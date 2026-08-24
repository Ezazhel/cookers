import { useState } from 'react';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { HuntCard } from './HuntCard';
import { RegisterHuntModal } from './RegisterHuntModal';

/** Send workers to hunt, follow them, and register what they bring back. */
export const HuntView = () => {
  const { hunts, availableWorkers, canHunt, isRoundRunning, startHunt, registerLoot } =
    useKitchen();
  const [registeringHuntId, setRegisteringHuntId] = useState<string | null>(
    null,
  );

  const canSend = canHunt && isRoundRunning;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <section>
          <h2 className="mb-3 text-center text-base font-bold text-gray-900">
            Qui doit partir au donjon ?
          </h2>
          {availableWorkers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              Tout le monde est occupé
            </p>
          ) : (
            <ul className="flex flex-wrap justify-center gap-2">
              {availableWorkers.map((worker) => (
                <li key={worker.id}>
                  <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => startHunt(worker.id)}
                    className="min-h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 transition active:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {worker.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Chasses en cours
          </h2>
          {hunts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              Personne à la chasse
            </p>
          ) : (
            <ul className="space-y-2">
              {hunts.map((hunt) => (
                <li key={hunt.id}>
                  <HuntCard hunt={hunt} onRegister={setRegisteringHuntId} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {!isRoundRunning && (
        <p className="shrink-0 text-center text-sm text-gray-500">
          Démarrez la journée pour chasser.
        </p>
      )}
      {isRoundRunning && !canHunt && (
        <p className="shrink-0 text-center text-sm text-amber-700">
          Aucun ouvrier disponible.
        </p>
      )}

      <RegisterHuntModal
        open={registeringHuntId !== null}
        onCancel={() => setRegisteringHuntId(null)}
        onConfirm={(monsterIds) => {
          if (registeringHuntId) registerLoot(registeringHuntId, monsterIds);
          setRegisteringHuntId(null);
        }}
      />
    </div>
  );
};
