"use client";

import {
  FieldErrors,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { ChevronDown, X } from "lucide-react";
import { Counter } from "@/components/ui/Counter";
import { QUESTION_TYPE_OPTIONS } from "@/features/assignments/constants";
import { AssignmentCreateFormInput } from "@/features/assignments/form-schema";

interface QuestionTypeRowProps {
  index: number;
  canRemove: boolean;
  errors?: FieldErrors<AssignmentCreateFormInput>["questionTypes"];
  marks: number;
  noOfQuestions: number;
  register: UseFormRegister<AssignmentCreateFormInput>;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<AssignmentCreateFormInput>;
}

export const QuestionTypeRow = ({
  canRemove,
  errors,
  index,
  marks,
  noOfQuestions,
  register,
  remove,
  setValue,
}: QuestionTypeRowProps) => {
  const rowErrors = errors?.[index];

  return (
    <div className="grid items-start gap-x-4 gap-y-3 md:grid-cols-[minmax(0,1fr)_28px_136px_124px]">
      <div className="relative space-y-2">
        <select
          {...register(`questionTypes.${index}.type`)}
          className="h-14 w-full appearance-none rounded-full bg-white px-5 pr-12 text-[18px] font-medium text-primary outline-none"
        >
          {QUESTION_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-[18px] text-primary"
        />
        {rowErrors?.type ? (
          <p className="text-sm text-danger">{rowErrors.type.message}</p>
        ) : null}
      </div>

      <div className="flex h-14 items-center justify-center">
        <button
          type="button"
          onClick={() => remove(index)}
          disabled={!canRemove}
          className="text-primary transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <X size={22} strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="hidden"
          {...register(`questionTypes.${index}.noOfQuestions`, {
            valueAsNumber: true,
          })}
        />
        <Counter
          value={noOfQuestions}
          onChange={(next) =>
            setValue(`questionTypes.${index}.noOfQuestions`, next, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        {rowErrors?.noOfQuestions ? (
          <p className="text-sm text-danger">{rowErrors.noOfQuestions.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <input
          type="hidden"
          {...register(`questionTypes.${index}.marks`, {
            valueAsNumber: true,
          })}
        />
        <Counter
          value={marks}
          onChange={(next) =>
            setValue(`questionTypes.${index}.marks`, next, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        {rowErrors?.marks ? (
          <p className="text-sm text-danger">{rowErrors.marks.message}</p>
        ) : null}
      </div>
    </div>
  );
};
