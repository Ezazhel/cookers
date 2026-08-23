import { useKitchen } from '@/features/kitchen/context/KitchenContext';

/** Title screen: the entry point of a game. */
export const HomeScreen = () => {
  const { openSetup } = useKitchen();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          Cookers
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Chassez, préparez, cuisinez.
        </p>
      </div>

      <button
        type="button"
        onClick={openSetup}
        className="min-h-14 w-full max-w-xs rounded-xl bg-emerald-600 text-lg font-bold text-white active:bg-emerald-700"
      >
        Jouer
      </button>
    </div>
  );
};
