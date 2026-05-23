import mongoose, { Schema, Document } from "mongoose";
import {
  IAssignment,
  IGeneratedPaper,
  IQuestion,
  IQuestionTypeInput,
  ISection,
} from "../types/assignment.types";

export interface IAssignmentDocument
  extends Omit<IAssignment, "_id">, Document {}

const QuestionTypeSchema = new Schema<IQuestionTypeInput>(
  {
    type: { type: String, required: true },
    noOfQuestions: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Challenging"],
      required: true,
    },
    marks: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false },
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    sections: { type: [SectionSchema], required: true },
  },
  { _id: false },
);

const AssignmentSchema = new Schema<IAssignmentDocument>(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInstructions: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    result: { type: GeneratedPaperSchema, default: null },
  },
  { timestamps: true },
);

export const Assignment = mongoose.model<IAssignmentDocument>(
  "Assignment",
  AssignmentSchema,
);
