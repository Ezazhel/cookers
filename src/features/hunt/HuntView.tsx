import { useState } from 'react';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { cn } from '@/lib/utils';
import { HuntCard } from './HuntCard';
import { RegisterHuntModal } from './RegisterHuntModal';

/** Send workers to hunt, follow them, and register what they bring back. */
export const HuntView = () => {
  const {
    hunts,
    availableWorkers,
    canHunt,
    isRoundRunning,
    startHunt,
    registerLoot,
  } = useKitchen();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [registeringHuntId, setRegisteringHuntId] = useState<string | null>(
    null,
  );

  const canSend = selectedWorkerId !== null && canHunt && isRoundRunning;

  const handleSend = () => {
    if (!selectedWorkerId) return;
    startHunt(selectedWorkerId);
    setSelectedWorkerId(null);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <section>
          <h2 className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Ouvriers disponibles
          </h2>
          {availableWorkers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              Tout le monde est occupé
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {availableWorkers.map((worker) => {
                const selected = worker.id === selectedWorkerId;
                return (
                  <li key={worker.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkerId(worker.id)}
                      className={cn(
                        'min-h-11 rounded-xl border px-4 text-sm font-semibold transition',
                        selected
                          ? 'border-sky-500 bg-sky-50 text-sky-900'
                          : 'border-gray-200 bg-white text-gray-800 active:bg-gray-50',
                      )}
                    >
                      {worker.name}
                    </button>
                  </li>
                );
              })}
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

      <div className="shrink-0 space-y-3">
        {!isRoundRunning && (
          <p className="text-center text-sm text-gray-500">
            Démarrez la journée pour chasser.
          </p>
        )}
        {isRoundRunning && !canHunt && (
          <p className="text-center text-sm text-amber-700">
            Aucun ouvrier disponible.
          </p>
        )}
        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className={cn(
            'min-h-14 w-full rounded-xl text-lg font-bold text-white transition',
            canSend
              ? 'bg-sky-500 active:bg-sky-600'
              : 'cursor-not-allowed bg-gray-300',
          )}
        >
          Envoyer chasser
        </button>
      </div>

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
