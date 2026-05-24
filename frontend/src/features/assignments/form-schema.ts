import { z } from "zod";
import { QUESTION_TYPE_OPTIONS } from "@/features/assignments/constants";

// Helper to reliably normalize any raw browser string to standard local Midnight
const parseToLocalMidnight = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  let year: number, month: number, day: number;

  // Handle native element YYYY-MM-DD format mappings
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-").map(Number);
    if (parts[0] > 1000) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
  } else if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map(Number);
    if (parts[2] > 1000) {
      [day, month, year] = parts;
    } else {
      [year, month, day] = parts;
    }
  } else {
    const fallback = new Date(dateStr);
    if (Number.isNaN(fallback.getTime())) return null;
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }

  const result = new Date(year, month - 1, day);
  if (Number.isNaN(result.getTime())) return null;
  result.setHours(0, 0, 0, 0);
  return result;
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
    .refine(
      (value) => parseToLocalMidnight(value) !== null,
      "Invalid date format",
    )
    .refine((value) => {
      const targetDate = parseToLocalMidnight(value);
      if (!targetDate) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return targetDate >= today;
    }, "Due date cannot be in the past")
    // FIX: Transform it directly into an ISO String or Date object for MongoDB
    .transform((value) => {
      const targetDate = parseToLocalMidnight(value);
      // Sending the standard ISO string format guarantees MongoDB can save it cleanly
      return targetDate ? targetDate.toISOString() : value;
    }),
  questionTypes: z
    .array(questionTypeSchema)
    .min(1, "Add at least one question type"),
  additionalInstructions: z.string().trim().optional().default(""),
  fileUrl: z.string().optional().default(""),
});

export type AssignmentCreateFormInput = z.input<typeof assignmentCreateSchema>;
export type AssignmentCreateFormValues = z.output<
  typeof assignmentCreateSchema
>;
