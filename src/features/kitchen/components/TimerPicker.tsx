import { TIMER_OPTIONS } from '@/config';
import { cn } from '@/lib/utils';

interface TimerPickerProps {
  value: number;
  onChange: (value: number) => void;
  options?: readonly number[];
}

export const TimerPicker = ({
  value,
  onChange,
  options = TIMER_OPTIONS,
}: TimerPickerProps) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={cn(
          'min-h-12 min-w-12 shrink-0 rounded-full border text-base font-semibold transition',
          value === option
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50',
        )}
      >
        {option}
      </button>
    ))}
  </div>
);
