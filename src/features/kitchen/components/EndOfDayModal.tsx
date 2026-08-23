import { Modal } from '@/components/Modal';
import { StepperRow } from '@/components/StepperRow';
import { PREPARE_SLOTS_MIN, ROUND_MIN_MINUTES } from '@/config';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';

/** Shown when the main timer runs out. Lets the players tweak next-day
 *  settings (round length, cutting boards) — the only moment those are
 *  editable besides the very first pre-game setup — then either start the
 *  next day or end the game outright. */
export const EndOfDayModal = () => {
  const {
    round,
    day,
    settings,
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

      <div className="space-y-4">
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
