import { Modal } from '@/components/Modal';
import { ROUND_MIN_MINUTES } from '@/config';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { round, setRoundDuration } = useKitchen();
  const minutes = round.durationMinutes;

  const stepButton =
    'flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 text-2xl font-bold text-gray-700 disabled:opacity-40 active:bg-gray-50';

  return (
    <Modal open={open} title="Paramètres de la manche" onClose={onClose}>
      <label className="mb-2 block text-center text-sm font-semibold text-gray-600">
        Durée de la journée (minutes)
      </label>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className={stepButton}
          disabled={minutes <= ROUND_MIN_MINUTES}
          onClick={() => setRoundDuration(minutes - 1)}
        >
          −
        </button>

        <input
          type="number"
          min={ROUND_MIN_MINUTES}
          value={minutes}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(next)) setRoundDuration(next);
          }}
          className="h-14 w-20 rounded-xl border border-gray-300 text-center text-2xl font-black text-gray-900"
        />

        <button
          type="button"
          className={stepButton}
          onClick={() => setRoundDuration(minutes + 1)}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className={cn(
          'mt-6 min-h-12 w-full rounded-xl bg-gray-900 text-base font-bold text-white active:bg-gray-800',
        )}
      >
        Fermer
      </button>
    </Modal>
  );
};
