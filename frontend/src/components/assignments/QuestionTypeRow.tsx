"use client";

import { useAssignmentFormStore } from "@/store/assignmentForm.store";
import { X } from "lucide-react";

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Answer Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True or False",
  "Fill in the Blanks",
];

interface Props {
  index: number;
}

export const QuestionTypeRow = ({ index }: Props) => {
  const { questionTypes, updateQuestionType, removeQuestionType } =
    useAssignmentFormStore();
  const qt = questionTypes[index];
  if (!qt) return null;

  const increment = (key: "noOfQuestions" | "marks") => {
    updateQuestionType(index, key, qt[key] + 1);
  };

  const decrement = (key: "noOfQuestions" | "marks") => {
    if (qt[key] <= 1) return;
    updateQuestionType(index, key, qt[key] - 1);
  };

  return (
    <div className="grid grid-cols-[1fr,auto,auto] gap-2 items-center">
      {/* Dropdown */}
      <div className="flex items-center gap-2 border border-[#E5E5E5] rounded-lg px-3 py-2 bg-white">
        <select
          value={qt.type}
          onChange={(e) => updateQuestionType(index, "type", e.target.value)}
          className="flex-1 text-xs text-[#111111] outline-none bg-transparent cursor-pointer"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={() => removeQuestionType(index)}
          className="text-[#9CA3AF] hover:text-red-500 transition-colors ml-1"
        >
          <X size={13} />
        </button>
      </div>

      {/* No. of Questions Counter */}
      <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-lg px-2 py-2 bg-white w-24 justify-between">
        <button
          onClick={() => decrement("noOfQuestions")}
          className="w-5 h-5 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] font-bold text-sm"
        >
          −
        </button>
        <span className="text-xs font-medium text-[#111111] w-4 text-center">
          {qt.noOfQuestions}
        </span>
        <button
          onClick={() => increment("noOfQuestions")}
          className="w-5 h-5 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] font-bold text-sm"
        >
          +
        </button>
      </div>

      {/* Marks Counter */}
      <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-lg px-2 py-2 bg-white w-20 justify-between">
        <button
          onClick={() => decrement("marks")}
          className="w-5 h-5 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] font-bold text-sm"
        >
          −
        </button>
        <span className="text-xs font-medium text-[#111111] w-4 text-center">
          {qt.marks}
        </span>
        <button
          onClick={() => increment("marks")}
          className="w-5 h-5 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] font-bold text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
};
