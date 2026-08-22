import { useState } from 'react';
import { EndOfDayModal } from '@/features/kitchen/components/EndOfDayModal';
import { ModeTabs } from '@/features/kitchen/components/ModeTabs';
import { RoundBar } from '@/features/kitchen/components/RoundBar';
import { SettingsModal } from '@/features/kitchen/components/SettingsModal';
import { StageView } from '@/features/kitchen/components/StageView';
import { TimerTray } from '@/features/kitchen/components/TimerTray';
import type { Stage } from '@/models/food';
import { AppProvider } from './provider';

const KitchenApp = () => {
  const [mode, setMode] = useState<Stage>('prepare');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-full flex-col bg-gray-50 text-gray-900">
      <RoundBar onOpenSettings={() => setSettingsOpen(true)} />

      <TimerTray stage="prepare" />
      <TimerTray stage="cook" />

      <main className="flex min-h-0 flex-1 flex-col px-4 pt-24 pb-3">
        <h1 className="mb-3 shrink-0 text-center text-xl font-black tracking-tight">
          {mode === 'prepare' ? 'Préparation' : 'Cuisine'}
        </h1>
        {/* key remounts the stage so selection/timer picker reset on switch */}
        <div className="min-h-0 flex-1">
          <StageView key={mode} stage={mode} />
        </div>
      </main>

      <ModeTabs mode={mode} onChange={setMode} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <EndOfDayModal />
    </div>
  );
};

export const App = () => (
  <AppProvider>
    <KitchenApp />
  </AppProvider>
);
