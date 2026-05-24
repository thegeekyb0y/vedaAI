import { Minus, Plus } from "lucide-react";

interface CounterProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}

export const Counter = ({ value, onChange, min = 1 }: CounterProps) => {
  const decrement = () => {
    if (value <= min) return;
    onChange(value - 1);
  };

  return (
    <div className="inline-flex h-11 items-center justify-between rounded-2xl border border-(--color-border) bg-white px-2.5 shadow-(--shadow-soft)">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full text-(--color-secondary) transition-colors hover:bg-(--color-surface-subtle) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold text-(--color-primary)">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-(--color-secondary) transition-colors hover:bg-(--color-surface-subtle) hover:text-(--color-primary)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
