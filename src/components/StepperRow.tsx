const stepButton =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 text-xl font-bold text-gray-700 disabled:opacity-40 active:bg-gray-50';

interface StepperRowProps {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

export const StepperRow = ({ label, value, min, onChange }: StepperRowProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={stepButton}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(next)) onChange(next);
        }}
        className="h-11 w-16 rounded-xl border border-gray-300 text-center text-lg font-black text-gray-900"
      />
      <button
        type="button"
        className={stepButton}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  </div>
);
