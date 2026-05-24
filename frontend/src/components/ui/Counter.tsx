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
    <div className="inline-flex h-14 min-w-[124px] items-center justify-between rounded-full bg-white px-4">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#d3d3d3] transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Minus size={18} strokeWidth={2} />
      </button>
      <span className="min-w-6 text-center text-[17px] font-semibold text-primary">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#d3d3d3] transition-colors hover:text-primary"
      >
        <Plus size={18} strokeWidth={2} />
      </button>
    </div>
  );
};
