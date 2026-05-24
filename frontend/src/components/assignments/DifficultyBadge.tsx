import { Difficulty } from "@/types/assignment.types";

interface Props {
  difficulty: Difficulty;
}

const config: Record<Difficulty, { label: string; className: string }> = {
  Easy: {
    label: "Easy",
    className: "bg-green-50 text-green-600 border border-green-200",
  },
  Moderate: {
    label: "Moderate",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  Challenging: {
    label: "Challenging",
    className: "bg-red-50 text-red-500 border border-red-200",
  },
};

export const DifficultyBadge = ({ difficulty }: Props) => {
  const { label, className } = config[difficulty];
  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${className}`}
    >
      {label}
    </span>
  );
};
