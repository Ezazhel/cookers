import { useState } from 'react';
import { CardGrid, SelectCard } from '@/components/CardGrid';
import { Modal } from '@/components/Modal';
import { findMonster, findRecipe } from '@/data/monsters';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';

interface FrigoModalProps {
  open: boolean;
  /** Starts the next day once the storage decision and shelf-shift reminder
   *  are both acknowledged. */
  onStart: () => void;
}

const preparedKey = (item: { monsterId: string; recipeId: string }) =>
  `${item.monsterId}:${item.recipeId}`;

/**
 * End-of-day Frigo flow, shown after the recap once "Jour N+1" is tapped:
 * first pick what to store (everything else not chosen is lost), then a
 * shelf-shift reminder before actually starting the next day.
 */
export const FrigoModal = ({ open, onStart }: FrigoModalProps) => {
  const {
    settings,
    frigoSlotsUsed,
    storableCarcasses,
    storablePreparedItems,
    storeInFrigo,
  } = useKitchen();

  // The parent remounts this component (via a `key` tied to its open/closed
  // transitions) each time it's freshly shown, so these initial values are
  // enough — no reset effect needed.
  const [step, setStep] = useState<'pick' | 'reminder'>('pick');
  const [selectedCarcasses, setSelectedCarcasses] = useState<string[]>([]);
  const [selectedPrepared, setSelectedPrepared] = useState<string[]>([]);

  const selectionSlots =
    selectedCarcasses.length + Math.ceil(selectedPrepared.length / 2);
  const remaining = settings.frigoSlots - frigoSlotsUsed - selectionSlots;
  const halfSlotOpen = selectedPrepared.length % 2 === 1;

  const toggleCarcass = (monsterId: string) => {
    setSelectedCarcasses((current) =>
      current.includes(monsterId)
        ? current.filter((id) => id !== monsterId)
        : [...current, monsterId],
    );
  };

  const togglePrepared = (item: { monsterId: string; recipeId: string }) => {
    const key = preparedKey(item);
    setSelectedPrepared((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  };

  const confirm = () => {
    storeInFrigo(
      selectedCarcasses,
      selectedPrepared.map((key) => {
        const [monsterId, recipeId] = key.split(':');
        return { monsterId, recipeId };
      }),
    );
    setStep('reminder');
  };

  if (step === 'reminder') {
    return (
      <Modal open={open} title="Avant de commencer" dismissible={false}>
        <p className="mb-6 text-center text-base text-gray-700">
          Descendez les ingrédients du frigo d'un étage.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="min-h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
        >
          Commencer la journée
        </button>
      </Modal>
    );
  }

  return (
    <Modal open={open} title="Frigo — que conservez-vous ?" dismissible={false}>
      <p className="mb-3 text-center text-xs text-gray-500">
        {selectionSlots + frigoSlotsUsed} / {settings.frigoSlots} emplacements
        utilisés · le reste sera perdu
      </p>

      <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
        <section>
          <h3 className="mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Carcasses
          </h3>
          {storableCarcasses.length === 0 ? (
            <p className="text-sm text-gray-400">Rien à conserver.</p>
          ) : (
            <CardGrid>
              {storableCarcasses.map((carcass) => {
                const selected = selectedCarcasses.includes(carcass.monsterId);
                return (
                  <SelectCard
                    key={carcass.monsterId}
                    label={findMonster(carcass.monsterId)?.name ?? carcass.monsterId}
                    selected={selected}
                    disabled={!selected && remaining <= 0}
                    accent="frigo"
                    multi
                    onSelect={() => toggleCarcass(carcass.monsterId)}
                  />
                );
              })}
            </CardGrid>
          )}
        </section>

        <section>
          <h3 className="mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Aliments préparés
          </h3>
          {storablePreparedItems.length === 0 ? (
            <p className="text-sm text-gray-400">Rien à conserver.</p>
          ) : (
            <CardGrid>
              {storablePreparedItems.map((item) => {
                const key = preparedKey(item);
                const selected = selectedPrepared.includes(key);
                return (
                  <SelectCard
                    key={key}
                    label={findRecipe(item.monsterId, item.recipeId)?.name ?? item.recipeId}
                    hint={findMonster(item.monsterId)?.name}
                    selected={selected}
                    disabled={!selected && remaining <= 0 && !halfSlotOpen}
                    accent="frigo"
                    multi
                    onSelect={() => togglePrepared(item)}
                  />
                );
              })}
            </CardGrid>
          )}
        </section>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        Une carcasse ne protège que ce qui n'est pas encore préparé — un
        aliment déjà préparé doit être conservé à part.
      </p>

      <button
        type="button"
        onClick={confirm}
        className="mt-4 min-h-12 w-full rounded-xl bg-teal-600 text-base font-bold text-white active:bg-teal-700"
      >
        Valider
      </button>
    </Modal>
  );
};
