import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { findMonster, findRecipe } from '@/data/monsters';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';
import { Timer } from './Timer';

interface TimerTrayProps {
  stage: Stage;
}

/**
 * Corner container for the active timers of a stage:
 * prepare timers dock top-left, cook timers top-right (stacked, scrollable).
 */
export const TimerTray = ({ stage }: TimerTrayProps) => {
  const { activeTimers, finishPrepare, serveDish, cancelTimer } = useKitchen();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const timers = activeTimers.filter((timer) => timer.stage === stage);

  const cancelTarget = activeTimers.find((t) => t.id === cancelId);
  const cancelRecipe =
    cancelTarget && findRecipe(cancelTarget.monsterId, cancelTarget.recipeId);
  const cancelMonster = cancelTarget && findMonster(cancelTarget.monsterId);

  if (timers.length === 0 && !cancelTarget) return null;

  const isPrepare = stage === 'prepare';
  const actionLabel = isPrepare ? 'Ranger en stock' : 'Servir';
  const onAction = isPrepare ? finishPrepare : serveDish;

  return (
    <>
      {timers.length > 0 && (
        <div
          className={cn(
            'pointer-events-none fixed top-[4.5rem] z-20 flex max-h-[55vh] w-[42vw] max-w-56 flex-col gap-2 overflow-y-auto',
            isPrepare ? 'left-2 items-start' : 'right-2 items-end',
          )}
        >
          {timers.map((timer) => (
            <div key={timer.id} className="w-full">
              <Timer
                timer={timer}
                actionLabel={actionLabel}
                onAction={onAction}
                onRequestCancel={setCancelId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Rendered outside the fixed tray above so it lays out relative to the
       *  viewport, not the tray's own positioned/scrollable box. */}
      <Modal open={cancelTarget !== undefined} title="Annuler ?" dismissible={false}>
        <p className="mb-6 text-center text-base text-gray-700">
          Annuler {cancelRecipe?.name ?? 'cette action'}
          {cancelMonster ? ` (${cancelMonster.name})` : ''} ? Le joueur
          redevient disponible.
        </p>
        <button
          type="button"
          onClick={() => {
            if (cancelId) cancelTimer(cancelId);
            setCancelId(null);
          }}
          className="min-h-12 w-full rounded-xl bg-red-600 text-base font-bold text-white active:bg-red-700"
        >
          Oui, annuler
        </button>
        <button
          type="button"
          onClick={() => setCancelId(null)}
          className="mt-2 min-h-11 w-full rounded-xl text-sm font-bold text-gray-500 active:bg-gray-50"
        >
          Non
        </button>
      </Modal>
    </>
  );
};
