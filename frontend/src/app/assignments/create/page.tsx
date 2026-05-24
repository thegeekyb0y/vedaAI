"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssignmentFormStore } from "@/store/assignmentForm.store";
import { createAssignment, uploadFile } from "@/lib/api";
import { Plus, ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { QuestionTypeRow } from "@/components/assignments/QuestionTypeRow";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const store = useAssignmentFormStore();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const totalQuestions = store.questionTypes.reduce(
    (sum, qt) => sum + qt.noOfQuestions,
    0,
  );
  const totalMarks = store.questionTypes.reduce(
    (sum, qt) => sum + qt.noOfQuestions * qt.marks,
    0,
  );

  const handleFile = async (file: File) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF and images allowed");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      store.setField("fileUrl", url);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!store.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!store.dueDate) {
      toast.error("Due date is required");
      return;
    }
    if (new Date(store.dueDate) < new Date()) {
      toast.error("Due date cannot be in the past");
      return;
    }
    if (store.questionTypes.length === 0) {
      toast.error("Add at least one question type");
      return;
    }

    setSubmitting(true);
    try {
      const assignment = await createAssignment({
        title: store.title,
        dueDate: store.dueDate,
        questionTypes: store.questionTypes,
        additionalInstructions: store.additionalInstructions,
        fileUrl: store.fileUrl,
      });
      store.reset();
      router.push(`/assignments/${assignment._id}`);
    } catch {
      toast.error("Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <h1 className="text-base font-semibold text-[#111111]">
            Create Assignment
          </h1>
        </div>
        <p className="text-xs text-[#9CA3AF] ml-4">
          Set up a new assignment for your students.
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#E5E5E5] rounded-full mb-6">
        <div className="h-1 bg-[#111111] rounded-full w-1/2" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 mb-4">
        <h2 className="text-sm font-semibold text-[#111111] mb-1">
          Assignment Details
        </h2>
        <p className="text-xs text-[#9CA3AF] mb-5">
          Basic information about your assignment.
        </p>

        {/* Title */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Assignment Title"
            value={store.title}
            onChange={(e) => store.setField("title", e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111] transition-colors"
          />
        </div>

        {/* File Upload */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center mb-4 transition-colors cursor-pointer ${
            dragOver
              ? "border-[#111111] bg-gray-50"
              : "border-[#E5E5E5] hover:border-[#9CA3AF]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          {store.fileUrl ? (
            <p className="text-sm text-green-600 font-medium">
              File uploaded ✓
            </p>
          ) : (
            <>
              <p className="text-sm text-[#6B6B6B] mb-1">
                {uploading
                  ? "Uploading..."
                  : "Choose a file or drag & drop it here"}
              </p>
              <p className="text-xs text-[#9CA3AF] mb-3">
                JPEG, PNG, PDF up to 10MB
              </p>
              <button className="px-4 py-1.5 border border-[#E5E5E5] rounded-lg text-xs text-[#6B6B6B] bg-white hover:bg-gray-50 transition-colors">
                Browse Files
              </button>
            </>
          )}
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
        <p className="text-xs text-[#9CA3AF] text-center mb-5">
          Upload images of your preferred document/image
        </p>

        {/* Due Date */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-[#111111] mb-2">
            Due Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={store.dueDate}
              onChange={(e) => store.setField("dueDate", e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm text-[#111111] outline-none focus:border-[#111111] transition-colors appearance-none"
            />
            <Calendar
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            />
          </div>
        </div>

        {/* Question Types */}
        <div className="mb-4">
          <div className="grid grid-cols-[1fr,auto,auto] gap-2 mb-2">
            <span className="text-xs font-medium text-[#111111]">
              Question Type
            </span>
            <span className="text-xs font-medium text-[#111111] text-center w-24">
              No. of Questions
            </span>
            <span className="text-xs font-medium text-[#111111] text-center w-20">
              Marks
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {store.questionTypes.map((_, index) => (
              <QuestionTypeRow key={index} index={index} />
            ))}
          </div>

          <button
            onClick={store.addQuestionType}
            className="flex items-center gap-2 mt-3 text-xs text-[#6B6B6B] hover:text-[#111111] transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-[#111111] flex items-center justify-center">
              <Plus size={11} color="white" />
            </div>
            Add Question Type
          </button>

          {/* Totals */}
          <div className="flex flex-col items-end gap-0.5 mt-3">
            <span className="text-xs text-[#6B6B6B]">
              Total Questions :{" "}
              <span className="font-semibold text-[#111111]">
                {totalQuestions}
              </span>
            </span>
            <span className="text-xs text-[#6B6B6B]">
              Total Marks :{" "}
              <span className="font-semibold text-[#111111]">{totalMarks}</span>
            </span>
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-xs font-medium text-[#111111] mb-2">
            Additional Information{" "}
            <span className="text-[#9CA3AF] font-normal">
              (For better output)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            value={store.additionalInstructions}
            onChange={(e) =>
              store.setField("additionalInstructions", e.target.value)
            }
            className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111] transition-colors resize-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E5E5] bg-white rounded-full text-sm font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} />
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating..." : "Next"}
          {!submitting && <ArrowRight size={15} />}
        </button>
      </div>
    </div>
  );
}
