import { useState } from 'react';
import { CardGrid, SelectCard } from '@/components/CardGrid';
import { Modal } from '@/components/Modal';
import { MONSTERS } from '@/data/monsters';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';

interface RegisterHuntModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (monsterIds: string[]) => void;
}

/** Multi-select of what the hunter brought back: one carcass per monster. */
export const RegisterHuntModal = ({
  open,
  onCancel,
  onConfirm,
}: RegisterHuntModalProps) => {
  const { ownedMonsterIds } = useKitchen();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (monsterId: string) => {
    setSelected((current) =>
      current.includes(monsterId)
        ? current.filter((id) => id !== monsterId)
        : [...current, monsterId],
    );
  };

  const close = () => {
    setSelected([]);
    onCancel();
  };

  const confirm = () => {
    onConfirm(selected);
    setSelected([]);
  };

  return (
    <Modal open={open} title="Prises de la chasse" onClose={close}>
      <CardGrid>
        {MONSTERS.map((monster) => (
          <SelectCard
            key={monster.id}
            label={monster.name}
            selected={selected.includes(monster.id)}
            disabled={ownedMonsterIds.has(monster.id)}
            accent="hunt"
            multi
            onSelect={() => toggle(monster.id)}
          />
        ))}
      </CardGrid>

      <p className="mt-3 text-center text-xs text-gray-500">
        Une carcasse déjà en stock ne peut pas être rapportée.
      </p>

      <button
        type="button"
        onClick={confirm}
        className="mt-5 min-h-12 w-full rounded-xl bg-sky-600 text-base font-bold text-white active:bg-sky-700"
      >
        {selected.length === 0
          ? 'Aucune prise'
          : `Enregistrer (${selected.length})`}
      </button>
      <button
        type="button"
        onClick={close}
        className="mt-2 min-h-11 w-full rounded-xl text-sm font-bold text-gray-500 active:bg-gray-50"
      >
        Annuler
      </button>
    </Modal>
  );
};
