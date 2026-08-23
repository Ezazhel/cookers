import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Accent colour of a card grid: matches the tab it belongs to. */
export type Accent = 'prepare' | 'cook' | 'hunt';

const SELECTED: Record<Accent, string> = {
  prepare: 'border-amber-500 bg-amber-50 text-amber-900',
  cook: 'border-rose-500 bg-rose-50 text-rose-900',
  hunt: 'border-sky-500 bg-sky-50 text-sky-900',
};

const BADGE: Record<Accent, string> = {
  prepare: 'bg-amber-500',
  cook: 'bg-rose-500',
  hunt: 'bg-sky-500',
};

/** Compact square-card grid, so a whole monster or recipe set fits on screen. */
export const CardGrid = ({ children }: { children: ReactNode }) => (
  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">{children}</ul>
);

interface SelectCardProps {
  label: string;
  /** Secondary line under the label (duration, reward…). */
  hint?: string;
  /** Small corner count badge; hidden when undefined. */
  badge?: number;
  selected: boolean;
  disabled?: boolean;
  accent: Accent;
  /** Toggle semantics (multi-select) instead of single choice. */
  multi?: boolean;
  onSelect: () => void;
}

export const SelectCard = ({
  label,
  hint,
  badge,
  selected,
  disabled = false,
  accent,
  multi = false,
  onSelect,
}: SelectCardProps) => (
  <li>
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={multi ? selected : undefined}
      className={cn(
        'relative flex aspect-square min-h-22 w-full flex-col items-center justify-center gap-1 rounded-xl border px-1.5 text-center transition',
        selected
          ? SELECTED[accent]
          : 'border-gray-200 bg-white text-gray-800 active:bg-gray-50',
        disabled && 'opacity-40',
      )}
    >
      <span className="line-clamp-3 text-xs leading-tight font-semibold">
        {label}
      </span>
      {hint && (
        <span className="text-[0.625rem] leading-tight text-gray-500">
          {hint}
        </span>
      )}
      {badge !== undefined && (
        <span
          className={cn(
            'absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.625rem] font-bold text-white',
            BADGE[accent],
          )}
        >
          {badge}
        </span>
      )}
    </button>
  </li>
);
