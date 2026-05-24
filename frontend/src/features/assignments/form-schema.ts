import { z } from "zod";
import { QUESTION_TYPE_OPTIONS } from "@/features/assignments/constants";

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const questionTypeSchema = z.object({
  type: z
    .string()
    .min(1, "Question type is required")
    .refine(
      (value) =>
        QUESTION_TYPE_OPTIONS.includes(
          value as (typeof QUESTION_TYPE_OPTIONS)[number],
        ),
      "Select a valid question type",
    ),
  noOfQuestions: z.number().int().min(1, "Must be at least 1"),
  marks: z.number().int().min(1, "Must be at least 1"),
});

export const assignmentCreateSchema = z.object({
  title: z.string().trim().min(1, "Assignment title is required"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")
    .refine((value) => new Date(value) >= startOfToday(), "Due date cannot be in the past"),
  questionTypes: z
    .array(questionTypeSchema)
    .min(1, "Add at least one question type"),
  additionalInstructions: z.string().trim().optional().default(""),
  fileUrl: z.string().optional().default(""),
});

export type AssignmentCreateFormInput = z.input<
  typeof assignmentCreateSchema
>;

export type AssignmentCreateFormValues = z.output<
  typeof assignmentCreateSchema
>;
