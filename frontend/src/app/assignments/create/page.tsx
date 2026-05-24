"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Plus } from "lucide-react";
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
import { createAssignment, uploadFile } from "@/features/assignments/api";
import { getApiErrorMessage } from "@/lib/api";

const defaultValues: AssignmentCreateFormValues = {
  title: "",
  dueDate: "",
  questionTypes: [
    {
      type: "Multiple Choice Questions",
      noOfQuestions: 4,
      marks: 1,
    },
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

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<
    AssignmentCreateFormInput,
    undefined,
    AssignmentCreateFormValues
  >({
    defaultValues,
    resolver: zodResolver(assignmentCreateSchema),
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionTypes",
  });

  const questionTypes = useWatch({
    control,
    name: "questionTypes",
  });
  const fileUrl = useWatch({
    control,
    name: "fileUrl",
  });

  const totals = useMemo(() => {
    return (questionTypes ?? []).reduce(
      (accumulator, item) => {
        accumulator.totalQuestions += item.noOfQuestions;
        accumulator.totalMarks += item.noOfQuestions * item.marks;
        return accumulator;
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
    setUploadedFileName(file.name);

    try {
      const response = await uploadFile(file, (event) => {
        const nextProgress = getUploadProgress(event);
        if (typeof nextProgress === "number") {
          setUploadProgress(nextProgress);
        }
      });

      setValue("fileUrl", response.fileUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setUploadProgress(100);
      toast.success("Reference file uploaded");
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to upload file");
      setUploadError(message);
      setUploadedFileName("");
      setUploadProgress(null);
      setValue("fileUrl", "", { shouldDirty: true, shouldValidate: true });
      toast.error(message);
    }
  };

  const onSubmit = async (values: AssignmentCreateFormValues) => {
    setSubmitting(true);

    try {
      const assignment = await createAssignment(values);
      toast.success("Assignment created");
      router.push(`/assignments/${assignment._id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create assignment"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[34px] bg-white p-6 shadow-(--shadow-card) sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-orange)">
              Create Assignment
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-primary) sm:text-4xl">
              Configure the assignment generation brief
            </h1>
            <p className="mt-4 text-sm leading-7 text-(--color-secondary)">
              Add the assignment title, upload a reference file if needed, define
              question groups, and submit a clean payload to the existing generation flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-(--color-border) bg-(--color-surface-raised) p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-(--color-muted)">
                Question Groups
              </p>
              <p className="mt-2 text-3xl font-semibold text-(--color-primary)">
                {questionTypes?.length ?? 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-(--color-border) bg-(--color-surface-raised) p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-(--color-muted)">
                Total Marks
              </p>
              <p className="mt-2 text-3xl font-semibold text-(--color-primary)">
                {totals.totalMarks}
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("fileUrl")} />
        <section className="rounded-[34px] border border-(--color-border) bg-white p-6 shadow-(--shadow-card) sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
                  Assignment Title
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="Mid-Term Science Assessment"
                  className="h-14 w-full rounded-[24px] border border-(--color-border) bg-(--color-surface-raised) px-5 text-sm text-(--color-primary) outline-none transition-colors focus:border-(--color-primary)"
                />
                {errors.title ? (
                  <p className="text-sm text-(--color-danger)">{errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
                  Additional Instructions
                </label>
                <textarea
                  {...register("additionalInstructions")}
                  rows={5}
                  placeholder="Mention tone, complexity, duration expectations, or any answer style preferences for the generated paper."
                  className="w-full rounded-[24px] border border-(--color-border) bg-(--color-surface-raised) px-5 py-4 text-sm leading-7 text-(--color-primary) outline-none transition-colors focus:border-(--color-primary) resize-none"
                />
                {errors.additionalInstructions ? (
                  <p className="text-sm text-(--color-danger)">
                    {errors.additionalInstructions.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    {...register("dueDate")}
                    type="date"
                    className="h-14 w-full rounded-[24px] border border-(--color-border) bg-(--color-surface-raised) px-5 pr-12 text-sm text-(--color-primary) outline-none transition-colors focus:border-(--color-primary)"
                  />
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-(--color-muted)"
                  />
                </div>
                {errors.dueDate ? (
                  <p className="text-sm text-(--color-danger)">{errors.dueDate.message}</p>
                ) : null}
              </div>

              <div className="rounded-[28px] border border-(--color-border) bg-(--color-surface-raised) p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-muted)">
                  Live Summary
                </p>
                <div className="mt-4 space-y-3 text-sm text-(--color-secondary)">
                  <div className="flex items-center justify-between">
                    <span>Total Questions</span>
                    <span className="font-semibold text-(--color-primary)">
                      {totals.totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Marks</span>
                    <span className="font-semibold text-(--color-primary)">
                      {totals.totalMarks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reference File</span>
                    <span className="font-semibold text-(--color-primary)">
                      {fileUrl ? "Attached" : "Optional"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-(--color-border) bg-white p-6 shadow-(--shadow-card) sm:p-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-orange)">
              Optional Reference
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-(--color-primary)">
              Upload source material
            </h2>
            <p className="mt-2 text-sm leading-7 text-(--color-secondary)">
              Attach a PDF or image so the generator can use your reference material
              while preparing the paper.
            </p>
          </div>

          <FileUpload
            fileName={uploadedFileName}
            isUploaded={Boolean(fileUrl)}
            progress={uploadProgress ?? undefined}
            statusText={uploadProgress !== null && uploadProgress < 100 ? "Uploading your reference file" : undefined}
            error={uploadError ?? undefined}
            onFileSelect={(file) => void handleFileUpload(file)}
          />
        </section>

        <section className="rounded-[34px] border border-(--color-border) bg-white p-6 shadow-(--shadow-card) sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-orange)">
                Question Blueprint
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-(--color-primary)">
                Define question groups
              </h2>
              <p className="mt-2 text-sm leading-7 text-(--color-secondary)">
                Each group maps to a section in the generated paper and controls question count and marks.
              </p>
            </div>
            <Button
              variant="secondary"
              iconLeft={<Plus size={15} />}
              onClick={() =>
                append({
                  type: "Short Answer Questions",
                  noOfQuestions: 3,
                  marks: 2,
                })
              }
            >
              Add Question Type
            </Button>
          </div>

          <div className="space-y-4">
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
        </section>

        <div className="print-hidden flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            size="lg"
            iconLeft={<ArrowLeft size={16} />}
            onClick={() => router.push("/assignments")}
          >
            Back to Assignments
          </Button>
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            iconRight={<ArrowRight size={16} />}
          >
            Generate Assignment
          </Button>
        </div>
      </form>
    </div>
  );
}
