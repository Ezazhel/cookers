import { Modal } from '@/components/Modal';
import {
  HUNT_SECONDS_MIN,
  PREPARE_SLOTS_MIN,
  ROUND_MIN_MINUTES,
} from '@/config';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const stepButton =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 text-xl font-bold text-gray-700 disabled:opacity-40 active:bg-gray-50';

interface StepperRowProps {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

const StepperRow = ({ label, value, min, onChange }: StepperRowProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={stepButton}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(next)) onChange(next);
        }}
        className="h-11 w-16 rounded-xl border border-gray-300 text-center text-lg font-black text-gray-900"
      />
      <button
        type="button"
        className={stepButton}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  </div>
);

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const {
    settings,
    setRoundDuration,
    setPrepareSlots,
    setHuntTravelSeconds,
    setHuntReturnSeconds,
  } = useKitchen();

  return (
    <Modal open={open} title="Paramètres de la manche" onClose={onClose}>
      <div className="space-y-4">
        <StepperRow
          label="Durée de la journée (min)"
          value={settings.roundMinutes}
          min={ROUND_MIN_MINUTES}
          onChange={setRoundDuration}
        />
        <StepperRow
          label="Tables de préparation"
          value={settings.prepareSlots}
          min={PREPARE_SLOTS_MIN}
          onChange={setPrepareSlots}
        />
        <StepperRow
          label="Aller à la chasse (s)"
          value={settings.huntTravelSeconds}
          min={HUNT_SECONDS_MIN}
          onChange={setHuntTravelSeconds}
        />
        <StepperRow
          label="Retour de chasse (s)"
          value={settings.huntReturnSeconds}
          min={HUNT_SECONDS_MIN}
          onChange={setHuntReturnSeconds}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 min-h-12 w-full rounded-xl bg-gray-900 text-base font-bold text-white active:bg-gray-800"
      >
        Fermer
      </button>
    </Modal>
  );
};
