"use client";

import { FieldErrors, UseFieldArrayRemove, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Trash2 } from "lucide-react";
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
    <div className="rounded-[28px] border border-(--color-border) bg-white p-4 shadow-(--shadow-soft)">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_150px_130px_auto] xl:items-start">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
            Question Type
          </label>
          <select
            {...register(`questionTypes.${index}.type`)}
            className="h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface-raised) px-4 text-sm text-(--color-primary) outline-none transition-colors focus:border-(--color-primary)"
          >
            {QUESTION_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {rowErrors?.type ? (
            <p className="text-sm text-(--color-danger)">{rowErrors.type.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
            Questions
          </label>
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
            <p className="text-sm text-(--color-danger)">
              {rowErrors.noOfQuestions.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
            Marks
          </label>
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
            <p className="text-sm text-(--color-danger)">{rowErrors.marks.message}</p>
          ) : null}
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={!canRemove}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-secondary) transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-(--color-danger) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
