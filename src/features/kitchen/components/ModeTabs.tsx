import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';

interface ModeTabsProps {
  mode: Stage;
  onChange: (mode: Stage) => void;
}

const TABS: { stage: Stage; label: string }[] = [
  { stage: 'prepare', label: 'Préparer' },
  { stage: 'cook', label: 'Cuisiner' },
];

export const ModeTabs = ({ mode, onChange }: ModeTabsProps) => (
  <nav className="shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-2">
      {TABS.map((tab) => {
        const active = tab.stage === mode;
        return (
          <button
            key={tab.stage}
            type="button"
            onClick={() => onChange(tab.stage)}
            className={cn(
              'min-h-16 text-base font-bold transition',
              active
                ? tab.stage === 'prepare'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-500 text-white'
                : 'text-gray-500 active:bg-gray-50',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  </nav>
);
