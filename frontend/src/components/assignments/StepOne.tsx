"use client";

import { useMemo, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Plus,
  X,
  ChevronDown,
  Minus,
  CalendarPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { AxiosProgressEvent } from "axios";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import {
  AssignmentCreateFormInput,
  assignmentCreateSchema,
  AssignmentCreateFormValues,
} from "@/features/assignments/form-schema";
import { uploadFile } from "@/features/assignments/api";
import { getApiErrorMessage } from "@/lib/api";
import { QUESTION_TYPE_OPTIONS } from "@/features/assignments/constants";

const defaultValues: AssignmentCreateFormValues = {
  title: "Generated Assignment",
  dueDate: "",
  questionTypes: [
    { type: "Multiple Choice Questions", noOfQuestions: 4, marks: 1 },
  ],
  additionalInstructions: "",
  fileUrl: "",
};

const getUploadProgress = (event: AxiosProgressEvent) => {
  if (!event.total) return null;
  return Math.min(100, Math.round((event.loaded / event.total) * 100));
};

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

interface Props {
  onNext: (data: AssignmentCreateFormValues) => void;
  onBack: () => void;
}

// Custom hook to detect mobile vs desktop cleanly on the client side
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const listener = () => setIsMobile(media.matches);
    listener(); // Initial check
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
};

export const StepOne = ({ onNext, onBack }: Props) => {
  const isMobile = useIsMobile();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<AssignmentCreateFormInput, undefined, AssignmentCreateFormValues>(
    {
      defaultValues,
      resolver: zodResolver(assignmentCreateSchema),
      mode: "onSubmit",
    },
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionTypes",
  });
  const questionTypes = useWatch({ control, name: "questionTypes" });

  const totals = useMemo(() => {
    return (questionTypes ?? []).reduce(
      (acc, item) => {
        acc.totalQuestions += item.noOfQuestions;
        acc.totalMarks += item.noOfQuestions * item.marks;
        return acc;
      },
      { totalMarks: 0, totalQuestions: 0 },
    );
  }, [questionTypes]);

  const handleFileUpload = async (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      const message = "Only PDF and image files are supported";
      setUploadError(message);
      toast.error(message);
      return;
    }
    setUploadError(null);
    setUploadProgress(0);
    setIsUploaded(false);
    setUploadedFileName(file.name);
    try {
      const response = await uploadFile(file, (event) => {
        const next = getUploadProgress(event);
        if (typeof next === "number") setUploadProgress(next);
      });
      setValue("fileUrl", response.fileUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setUploadProgress(null);
      setIsUploaded(true);
      toast.success("Reference file uploaded");
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to upload file");
      setUploadError(message);
      setUploadedFileName("");
      setUploadProgress(null);
      setIsUploaded(false);
      setValue("fileUrl", "", { shouldDirty: true, shouldValidate: true });
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-0">
      <input type="hidden" {...register("title")} />
      <input type="hidden" {...register("fileUrl")} />

      {/* ── Desktop layout ── */}
      <div className="hidden md:block">
        <section className="rounded-[28px] border-2 border-white bg-white/50 p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Assignment Details
              </h2>
              <p className="mt-0.5 text-sm text-secondary">
                Basic information about your assignment
              </p>
            </div>

            <FileUpload
              fileName={uploadedFileName}
              isUploaded={isUploaded}
              progress={uploadProgress ?? undefined}
              error={uploadError ?? undefined}
              onFileSelect={(file) => void handleFileUpload(file)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Due Date
              </label>
              <div className="relative flex items-center rounded-2xl border border-border bg-surface-raised opacity-60 transition-opacity hover:opacity-80 focus-within:opacity-100 focus-within:border-primary">
                {!isMobile && (
                  <input
                    {...register("dueDate")}
                    type="date"
                    className="h-12 w-full bg-transparent px-4 uppercase text-sm text-primary outline-none"
                  />
                )}
              </div>
              {errors.dueDate && (
                <p className="text-sm text-danger">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)_28px_136px_124px] items-end gap-4 px-1">
                <span className="text-[18px] font-semibold text-primary">
                  Question Type
                </span>
                <span />
                <span className="text-center text-[18px] font-semibold text-primary">
                  No. of Questions
                </span>
                <span className="text-center text-[18px] font-semibold text-primary">
                  Marks
                </span>
              </div>

              <div className="space-y-5">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid items-start gap-x-4 gap-y-3 grid-cols-[minmax(0,1fr)_28px_136px_124px]"
                  >
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
                    </div>
                    <div className="flex h-14 items-center justify-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
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
                      <div className="inline-flex h-14 min-w-full items-center justify-between rounded-full bg-white px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const v = questionTypes[index]?.noOfQuestions ?? 1;
                            if (v > 1)
                              setValue(
                                `questionTypes.${index}.noOfQuestions`,
                                v - 1,
                                { shouldDirty: true, shouldValidate: true },
                              );
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#d3d3d3] hover:text-primary disabled:opacity-50"
                        >
                          <Minus size={18} strokeWidth={2} />
                        </button>
                        <span className="min-w-6 text-center text-[17px] font-semibold text-primary">
                          {questionTypes[index]?.noOfQuestions ??
                            field.noOfQuestions}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const v = questionTypes[index]?.noOfQuestions ?? 1;
                            setValue(
                              `questionTypes.${index}.noOfQuestions`,
                              v + 1,
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#d3d3d3] hover:text-primary"
                        >
                          <Plus size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="hidden"
                        {...register(`questionTypes.${index}.marks`, {
                          valueAsNumber: true,
                        })}
                      />
                      <div className="inline-flex h-14 min-w-full items-center justify-between rounded-full bg-white px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const v = questionTypes[index]?.marks ?? 1;
                            if (v > 1)
                              setValue(`questionTypes.${index}.marks`, v - 1, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#d3d3d3] hover:text-primary disabled:opacity-50"
                        >
                          <Minus size={18} strokeWidth={2} />
                        </button>
                        <span className="min-w-6 text-center text-[17px] font-semibold text-primary">
                          {questionTypes[index]?.marks ?? field.marks}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const v = questionTypes[index]?.marks ?? 1;
                            setValue(`questionTypes.${index}.marks`, v + 1, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#d3d3d3] hover:text-primary"
                        >
                          <Plus size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    type: "Short Answer Questions",
                    noOfQuestions: 3,
                    marks: 2,
                  })
                }
                className="flex items-center gap-3 pt-2 text-[18px] font-medium text-secondary transition-colors hover:text-primary"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2b2b2b] text-white">
                  <Plus size={22} strokeWidth={2.1} />
                </span>
                Add Question Type
              </button>
            </div>

            <div className="flex justify-end px-1">
              <div className="space-y-2 text-right text-[18px] text-primary">
                <p>
                  Total Questions :{" "}
                  <span className="font-semibold">{totals.totalQuestions}</span>
                </p>
                <p>
                  Total Marks :{" "}
                  <span className="font-semibold">{totals.totalMarks}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[18px] font-semibold text-primary">
                Additional Information (For better output)
              </label>
              <div className="relative">
                <textarea
                  {...register("additionalInstructions")}
                  rows={4}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="w-full rounded-[24px] border border-dashed border-[#e5e5e5] bg-white px-5 py-5 pr-16 text-[14px] leading-7 text-primary outline-none placeholder:text-secondary/80 resize-none"
                />
                <button
                  type="button"
                  className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            iconLeft={<ArrowLeft size={16} />}
            className="h-14 rounded-full px-8 text-[18px] font-medium shadow-none"
            onClick={onBack}
          >
            Previous
          </Button>
          <Button
            type="submit"
            iconRight={<ArrowRight size={16} />}
            className="h-14 rounded-full bg-[#1d1d1d] px-9 text-[18px] font-medium hover:bg-[#1d1d1d]"
          >
            Next
          </Button>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden space-y-4">
        {/* Progress bar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-1.5 rounded-full bg-primary" />
          <div className="h-1.5 rounded-full bg-border" />
        </div>

        {/* Main card */}
        <section className="rounded-[24px] bg-white px-4 py-5 shadow-sm">
          <div className="space-y-5">
            {/* Card header */}
            <div>
              <h2 className="text-[18px] font-bold text-primary">
                Assignment Details
              </h2>
              <p className="mt-0.5 text-[13px] text-secondary">
                Basic information about your assignment
              </p>
            </div>

            {/* File upload */}
            <FileUpload
              fileName={uploadedFileName}
              isUploaded={isUploaded}
              progress={uploadProgress ?? undefined}
              error={uploadError ?? undefined}
              onFileSelect={(file) => void handleFileUpload(file)}
            />

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-primary">
                Due Date
              </label>
              <div className="relative flex items-center rounded-2xl border border-border bg-white">
                {isMobile && (
                  <input
                    {...register("dueDate")}
                    type="date"
                    placeholder="DD-MM-YYYY"
                    className="h-12 w-full bg-transparent px-4 text-[14px] text-primary outline-none [&:not(:focus)]:text-secondary"
                  />
                )}
                <CalendarPlus
                  size={18}
                  className="absolute right-4 shrink-0 text-secondary pointer-events-none"
                />
              </div>
              {errors.dueDate && (
                <p className="text-[12px] text-danger">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Question Type */}
            <div className="space-y-3">
              <label className="text-[14px] font-bold text-primary">
                Question Type
              </label>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const noOfQ =
                    questionTypes[index]?.noOfQuestions ?? field.noOfQuestions;
                  const marks = questionTypes[index]?.marks ?? field.marks;

                  return (
                    <div
                      key={field.id}
                      className="rounded-[16px] border border-border bg-white p-3 space-y-3"
                    >
                      {/* Row 1: dropdown + X */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select
                            {...register(`questionTypes.${index}.type`)}
                            className="h-10 w-full appearance-none rounded-xl border border-border bg-white px-3 pr-8 text-[13px] font-medium text-primary outline-none"
                          >
                            {QUESTION_TYPE_OPTIONS.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                          className="flex h-8 w-8 shrink-0 items-center justify-center text-secondary disabled:opacity-30"
                        >
                          <X size={18} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Row 2: No. of Questions + Marks side by side */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* No. of Questions */}
                        <div className="space-y-1.5">
                          <span className="text-[12px] font-medium text-secondary">
                            No. of Questions
                          </span>
                          <input
                            type="hidden"
                            {...register(
                              `questionTypes.${index}.noOfQuestions`,
                              { valueAsNumber: true },
                            )}
                          />
                          <div className="flex h-10 items-center justify-between rounded-xl border border-border bg-white px-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (noOfQ > 1)
                                  setValue(
                                    `questionTypes.${index}.noOfQuestions`,
                                    noOfQ - 1,
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                              }}
                              disabled={noOfQ <= 1}
                              className="flex h-6 w-6 items-center justify-center text-secondary disabled:opacity-30"
                            >
                              <Minus size={14} strokeWidth={2} />
                            </button>
                            <span className="text-[14px] font-semibold text-primary">
                              {noOfQ}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  `questionTypes.${index}.noOfQuestions`,
                                  noOfQ + 1,
                                  { shouldDirty: true, shouldValidate: true },
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center text-secondary"
                            >
                              <Plus size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Marks */}
                        <div className="space-y-1.5">
                          <span className="text-[12px] font-medium text-secondary">
                            Marks
                          </span>
                          <input
                            type="hidden"
                            {...register(`questionTypes.${index}.marks`, {
                              valueAsNumber: true,
                            })}
                          />
                          <div className="flex h-10 items-center justify-between rounded-xl border border-border bg-white px-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (marks > 1)
                                  setValue(
                                    `questionTypes.${index}.marks`,
                                    marks - 1,
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                              }}
                              disabled={marks <= 1}
                              className="flex h-6 w-6 items-center justify-center text-secondary disabled:opacity-30"
                            >
                              <Minus size={14} strokeWidth={2} />
                            </button>
                            <span className="text-[14px] font-semibold text-primary">
                              {marks}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  `questionTypes.${index}.marks`,
                                  marks + 1,
                                  { shouldDirty: true, shouldValidate: true },
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center text-secondary"
                            >
                              <Plus size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Validation errors */}
                      {errors.questionTypes?.[index]?.noOfQuestions && (
                        <p className="text-[12px] text-danger">
                          {errors.questionTypes[index]?.noOfQuestions?.message}
                        </p>
                      )}
                      {errors.questionTypes?.[index]?.marks && (
                        <p className="text-[12px] text-danger">
                          {errors.questionTypes[index]?.marks?.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Question Type */}
              <button
                type="button"
                onClick={() =>
                  append({
                    type: "Short Answer Questions",
                    noOfQuestions: 3,
                    marks: 2,
                  })
                }
                className="flex items-center gap-2.5 pt-1 text-[14px] font-medium text-secondary"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2b2b2b] text-white">
                  <Plus size={18} strokeWidth={2.2} />
                </span>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="text-right text-[13px] text-primary space-y-1">
                <p>
                  Total Questions :{" "}
                  <span className="font-semibold">{totals.totalQuestions}</span>
                </p>
                <p>
                  Total Marks :{" "}
                  <span className="font-semibold">{totals.totalMarks}</span>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-primary">
                Additional Information (For better output)
              </label>
              <div className="relative">
                <textarea
                  {...register("additionalInstructions")}
                  rows={3}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="w-full rounded-[16px] border border-dashed border-border bg-white px-4 py-3 pr-12 text-[13px] leading-6 text-primary outline-none placeholder:text-secondary/70 resize-none"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary shadow-sm"
                >
                  <Mic size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Previous / Next — outside card, full width row */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            variant="secondary"
            iconLeft={<ArrowLeft size={15} />}
            className="h-12 flex-1 rounded-full text-[15px] font-medium"
            onClick={onBack}
            type="button"
          >
            Previous
          </Button>
          <Button
            type="submit"
            iconRight={<ArrowRight size={15} />}
            className="h-12 flex-1 rounded-full bg-[#1d1d1d] text-[15px] font-medium hover:bg-[#1d1d1d]"
          >
            Next
          </Button>
        </div>
      </div>
    </form>
  );
};
