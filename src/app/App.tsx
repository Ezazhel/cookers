import { useState } from 'react';
import { HuntView } from '@/features/hunt/HuntView';
import { EndOfDayModal } from '@/features/kitchen/components/EndOfDayModal';
import { ModeTabs, type BoardTab } from '@/features/kitchen/components/ModeTabs';
import { RoundBar } from '@/features/kitchen/components/RoundBar';
import { SettingsModal } from '@/features/kitchen/components/SettingsModal';
import { StageView } from '@/features/kitchen/components/StageView';
import { TimerTray } from '@/features/kitchen/components/TimerTray';
import { useKitchen } from '@/features/kitchen/context/KitchenContext';
import { HomeScreen } from '@/features/setup/HomeScreen';
import { SetupStepper } from '@/features/setup/SetupStepper';
import { AppProvider } from './provider';

const TITLES: Record<BoardTab, string> = {
  hunt: 'Chasse',
  prepare: 'Préparation',
  cook: 'Cuisine',
};

/** The board itself: top bar, timer trays, the active tab, and the tab bar. */
const Board = () => {
  // Hunting is the head of the loop, so it is where a day starts.
  const [mode, setMode] = useState<BoardTab>('hunt');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <RoundBar onOpenSettings={() => setSettingsOpen(true)} />

      <TimerTray stage="prepare" />
      <TimerTray stage="cook" />

      <main className="flex min-h-0 flex-1 flex-col px-4 pt-24 pb-3">
        <h1 className="mb-3 shrink-0 text-center text-xl font-black tracking-tight">
          {TITLES[mode]}
        </h1>
        {/* key remounts the view so its selection resets on switch */}
        <div className="min-h-0 flex-1">
          {mode === 'hunt' ? (
            <HuntView key={mode} />
          ) : (
            <StageView key={mode} stage={mode} />
          )}
        </div>
      </main>

      <ModeTabs mode={mode} onChange={setMode} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <EndOfDayModal />
    </>
  );
};

const KitchenApp = () => {
  const { phase } = useKitchen();

  return (
    <div className="flex h-full flex-col bg-gray-50 text-gray-900">
      {phase === 'home' && <HomeScreen />}
      {phase === 'setup' && <SetupStepper />}
      {phase === 'playing' && <Board />}
    </div>
  );
};

export const App = () => (
  <AppProvider>
    <KitchenApp />
  </AppProvider>
);
