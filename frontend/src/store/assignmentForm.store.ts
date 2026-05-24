import { create } from "zustand";
import { IQuestionTypeInput } from "@/types/assignment.types";

interface AssignmentFormState {
  title: string;
  dueDate: string;
  questionTypes: IQuestionTypeInput[];
  additionalInstructions: string;
  fileUrl: string;

  setField: <
    K extends keyof Omit<AssignmentFormState, "questionTypes" | SetterKeys>,
  >(
    key: K,
    value: AssignmentFormState[K],
  ) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (
    index: number,
    key: keyof IQuestionTypeInput,
    value: string | number,
  ) => void;
  reset: () => void;
}

type SetterKeys =
  | "setField"
  | "addQuestionType"
  | "removeQuestionType"
  | "updateQuestionType"
  | "reset";

const defaultQuestionTypes: IQuestionTypeInput[] = [
  { type: "Multiple Choice Questions", noOfQuestions: 4, marks: 1 },
];

export const useAssignmentFormStore = create<AssignmentFormState>((set) => ({
  title: "",
  dueDate: "",
  questionTypes: defaultQuestionTypes,
  additionalInstructions: "",
  fileUrl: "",

  setField: (key, value) => set((s) => ({ ...s, [key]: value })),

  addQuestionType: () =>
    set((s) => ({
      questionTypes: [
        ...s.questionTypes,
        { type: "Short Answer Questions", noOfQuestions: 3, marks: 2 },
      ],
    })),

  removeQuestionType: (index) =>
    set((s) => ({
      questionTypes: s.questionTypes.filter((_, i) => i !== index),
    })),

  updateQuestionType: (index, key, value) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((qt, i) =>
        i === index ? { ...qt, [key]: value } : qt,
      ),
    })),

  reset: () =>
    set({
      title: "",
      dueDate: "",
      questionTypes: defaultQuestionTypes,
      additionalInstructions: "",
      fileUrl: "",
    }),
}));
