import { useState } from 'react';
import { PLAYERS_DEFAULT, PLAYERS_MAX, PLAYERS_MIN } from '@/config';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { cn } from '@/lib/utils';
import type { Player } from '@/models/player';

const defaultName = (index: number) => `Joueur ${index + 1}`;

const stepButton =
  'flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 text-2xl font-bold text-gray-700 disabled:opacity-40 active:bg-gray-50';

/** Two-step game setup: how many players, then their names. */
export const SetupStepper = () => {
  const { startGame } = useKitchen();
  const [step, setStep] = useState<1 | 2>(1);
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: PLAYERS_DEFAULT }, (_, index) => defaultName(index)),
  );

  const setCount = (count: number) => {
    const next = Math.min(PLAYERS_MAX, Math.max(PLAYERS_MIN, count));
    setNames((current) =>
      Array.from(
        { length: next },
        (_, index) => current[index] ?? defaultName(index),
      ),
    );
  };

  const confirm = () => {
    const players: Player[] = names.map((name, index) => ({
      id: `player-${index + 1}`,
      name: name.trim() || defaultName(index),
    }));
    startGame(players);
  };

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-8">
      <div className="shrink-0 text-center">
        <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
          Étape {step} / 2
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
          {step === 1 ? 'Combien de joueurs ?' : 'Noms des joueurs'}
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {step === 1 ? (
          <div className="flex items-center justify-center gap-5 py-8">
            <button
              type="button"
              className={stepButton}
              disabled={names.length <= PLAYERS_MIN}
              onClick={() => setCount(names.length - 1)}
            >
              −
            </button>
            <span className="w-16 text-center text-5xl font-black tabular-nums text-gray-900">
              {names.length}
            </span>
            <button
              type="button"
              className={stepButton}
              disabled={names.length >= PLAYERS_MAX}
              onClick={() => setCount(names.length + 1)}
            >
              +
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {names.map((name, index) => (
              // Names are positional here — the index is the only stable key.
              <li key={index}>
                <input
                  type="text"
                  value={name}
                  aria-label={`Nom du joueur ${index + 1}`}
                  placeholder={defaultName(index)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNames((current) =>
                      current.map((item, i) => (i === index ? value : item)),
                    );
                  }}
                  className="min-h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-base font-medium text-gray-900"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 space-y-2">
        <button
          type="button"
          onClick={step === 1 ? () => setStep(2) : confirm}
          className={cn(
            'min-h-14 w-full rounded-xl text-lg font-bold text-white transition',
            'bg-emerald-600 active:bg-emerald-700',
          )}
        >
          {step === 1 ? 'Suivant' : 'Commencer'}
        </button>
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="min-h-11 w-full rounded-xl text-sm font-bold text-gray-500 active:bg-gray-50"
          >
            Retour
          </button>
        )}
      </div>
    </div>
  );
};
