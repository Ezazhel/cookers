import { Modal } from '@/components/Modal';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';

/** Alert shown when the main timer runs out. Closing ends the game and
 *  returns to the title screen. */
export const EndOfDayModal = () => {
  const { round, resetRound } = useKitchen();

  return (
    <Modal open={round.status === 'ended'} title="Fin de journée" dismissible={false}>
      <p className="mb-6 text-center text-base text-gray-700">
        Le temps est écoulé, fin de journée.
      </p>
      <button
        type="button"
        onClick={resetRound}
        className="min-h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
      >
        Terminer la partie
      </button>
    </Modal>
  );
};
