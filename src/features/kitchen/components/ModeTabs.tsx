import { cn } from '@/lib/utils';
import type { Stage } from '@/models/food';

/** The three board screens. Hunting comes first: it feeds everything else. */
export type BoardTab = 'hunt' | Stage;

interface ModeTabsProps {
  mode: BoardTab;
  onChange: (mode: BoardTab) => void;
}

const TABS: { tab: BoardTab; label: string; active: string }[] = [
  { tab: 'hunt', label: 'Chasse', active: 'bg-sky-500 text-white' },
  { tab: 'prepare', label: 'Préparer', active: 'bg-amber-500 text-white' },
  { tab: 'cook', label: 'Cuisiner', active: 'bg-rose-500 text-white' },
];

export const ModeTabs = ({ mode, onChange }: ModeTabsProps) => (
  <nav className="shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-3">
      {TABS.map((tab) => (
        <button
          key={tab.tab}
          type="button"
          onClick={() => onChange(tab.tab)}
          className={cn(
            'min-h-16 text-base font-bold transition',
            tab.tab === mode ? tab.active : 'text-gray-500 active:bg-gray-50',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </nav>
);
