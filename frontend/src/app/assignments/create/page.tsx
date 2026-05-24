"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { createAssignment } from "@/features/assignments/api";
import { getApiErrorMessage } from "@/lib/api";
import { AssignmentCreateFormValues } from "@/features/assignments/form-schema";
import { PaperMeta } from "@/types/assignment.types";
import { StepOne } from "@/components/assignments/StepOne";
import { StepTwo } from "@/components/assignments/StepTwo";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepOneData, setStepOneData] =
    useState<AssignmentCreateFormValues | null>(null);
  const [paperMeta, setPaperMeta] = useState<PaperMeta>({
    schoolName: "",
    subject: "",
    className: "",
    section: "",
    timeAllowed: "",
    maxMarks: "",
    instructions: "All questions are compulsory unless stated otherwise.",
  });

  const handleStepOneNext = (data: AssignmentCreateFormValues) => {
    setStepOneData(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepTwoSubmit = async (meta: PaperMeta) => {
    if (!stepOneData) return;
    setPaperMeta(meta);
    setSubmitting(true);
    try {
      const assignment = await createAssignment({
        ...stepOneData,
        title: `${meta.subject} — ${meta.className}`,
        paperMeta: meta, // ← pass meta to backend
      });
      toast.success("Assignment created");
      router.push(`/assignments/${assignment._id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create assignment"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] space-y-5">
      <div className="flex items-start gap-3 px-1">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary">
            Create Assignment
          </h1>
          <p className="mt-0.5 text-sm text-secondary">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`h-1.5 rounded-full transition-colors ${step === 1 ? "bg-primary" : "bg-border"}`}
          />
          <div
            className={`h-1.5 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-border"}`}
          />
        </div>

        {step === 1 && (
          <StepOne
            onNext={handleStepOneNext}
            onBack={() => router.push("/assignments")}
          />
        )}

        {step === 2 && (
          <StepTwo
            initialData={paperMeta}
            submitting={submitting}
            onSubmit={handleStepTwoSubmit}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
