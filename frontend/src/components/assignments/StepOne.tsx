"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, Mic, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosProgressEvent } from "axios";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { QuestionTypeRow } from "@/components/assignments/QuestionTypeRow";
import {
  AssignmentCreateFormInput,
  assignmentCreateSchema,
  AssignmentCreateFormValues,
} from "@/features/assignments/form-schema";
import { uploadFile } from "@/features/assignments/api";
import { getApiErrorMessage } from "@/lib/api";

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

export const StepOne = ({ onNext, onBack }: Props) => {
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
  const fileUrl = useWatch({ control, name: "fileUrl" });

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
            <label className="relative flex cursor-pointer items-center rounded-2xl border border-border bg-surface-raised opacity-60 transition-opacity hover:opacity-80 focus-within:opacity-100 focus-within:border-primary">
              <input
                {...register("dueDate")}
                type="date"
                className="h-12 w-full bg-transparent px-4 uppercase text-sm text-primary outline-none"
              />
            </label>
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
                <QuestionTypeRow
                  key={field.id}
                  index={index}
                  canRemove={fields.length > 1}
                  errors={errors.questionTypes}
                  marks={questionTypes[index]?.marks ?? field.marks}
                  noOfQuestions={
                    questionTypes[index]?.noOfQuestions ?? field.noOfQuestions
                  }
                  register={register}
                  remove={remove}
                  setValue={setValue}
                />
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
    </form>
  );
};
