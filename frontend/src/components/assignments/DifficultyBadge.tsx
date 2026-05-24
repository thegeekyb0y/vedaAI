import { Difficulty } from "@/types/assignment.types";

interface Props {
  difficulty: Difficulty;
}

const styles: Record<Difficulty, string> = {
  Easy: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  Moderate: "border border-amber-200 bg-amber-50 text-amber-700",
  Challenging: "border border-rose-200 bg-rose-50 text-rose-700",
};

export const DifficultyBadge = ({ difficulty }: Props) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[difficulty]}`}
  >
    {difficulty}
  </span>
);
