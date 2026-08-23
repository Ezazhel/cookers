import { Modal } from '@/components/Modal';
import { StepperRow } from '@/components/StepperRow';
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
