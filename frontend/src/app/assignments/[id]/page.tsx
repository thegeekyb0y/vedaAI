"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssignmentById, regenerateAssignment } from "@/lib/api";
import { IAssignment } from "@/types/assignment.types";
import { useJobSocket } from "@/hooks/useJobSocket";
import { Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { DifficultyBadge } from "@/components/assignments/DifficultyBadge";

export default function OutputPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAssignmentById(id);
        setAssignment(data);
      } catch {
        toast.error("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const { status, result } = useJobSocket(id, assignment?.status ?? "pending");

  const currentStatus = status ?? assignment?.status;
  const currentResult = result ?? assignment?.result;

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateAssignment(id);
      toast.success("Regenerating paper...");
    } catch {
      toast.error("Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const totalMarks =
    currentResult?.sections.reduce((sum, s) => sum + s.totalMarks, 0) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* AI Chat Bubble */}
      <div className="bg-[#1A1A1A] text-white rounded-2xl p-4 mb-4 flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed">
          Certainly! Here are customized Question Paper for your{" "}
          <span className="font-semibold">{assignment?.title}</span> based on
          your requirements.
        </p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-white text-[#111111] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-gray-100 transition-colors print:hidden"
        >
          <Download size={13} />
          Download as PDF
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handleRegenerate}
          disabled={regenerating || currentStatus === "processing"}
          className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] bg-white rounded-lg text-xs font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
          Regenerate
        </button>
      </div>

      {/* Processing State */}
      {(currentStatus === "pending" || currentStatus === "processing") && (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-[#111111]">
            Generating your question paper...
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            This may take a few seconds
          </p>
        </div>
      )}

      {/* Failed State */}
      {currentStatus === "failed" && (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-red-500 mb-4">
            Generation failed. Please try again.
          </p>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-[#333] transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}

      {/* Paper Output */}
      {currentStatus === "done" && currentResult && (
        <div
          id="paper"
          className="bg-white border border-[#E5E5E5] rounded-2xl p-8 font-sans"
        >
          {/* School Header */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-[#111111]">
              Delhi Public School, Sector-4, Bokaro
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Subject: {assignment?.title}
            </p>
            <p className="text-sm text-[#6B6B6B]">Class: 5th</p>
          </div>

          <hr className="border-[#E5E5E5] mb-4" />

          {/* Meta Row */}
          <div className="flex items-center justify-between mb-4 text-xs text-[#6B6B6B]">
            <span>Time Allowed: 45 minutes</span>
            <span>Maximum Marks: {totalMarks}</span>
          </div>

          <p className="text-xs text-[#6B6B6B] mb-5 italic">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student Info */}
          <div className="flex flex-col gap-2 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#6B6B6B]">Name:</span>
              <div className="flex-1 border-b border-[#111111]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B6B6B]">Roll Number:</span>
              <div className="w-40 border-b border-[#111111]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B6B6B]">Class/ Section:</span>
              <div className="w-32 border-b border-[#111111]" />
            </div>
          </div>

          <hr className="border-[#E5E5E5] mb-6" />

          {/* Sections */}
          {currentResult.sections.map((section, si) => (
            <div key={si} className="mb-8">
              {/* Section Title */}
              <h2 className="text-center text-sm font-bold text-[#111111] mb-1">
                {section.title}
              </h2>
              <p className="text-center text-xs text-[#6B6B6B] italic mb-4">
                {section.instruction}. Each question carries{" "}
                {section.questions[0]?.marks} marks
              </p>

              {/* Questions */}
              <div className="flex flex-col gap-4">
                {section.questions.map((q, qi) => (
                  <div key={qi} className="flex gap-3">
                    <span className="text-sm font-medium text-[#111111] min-w-5">
                      {q.questionNumber}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-[#111111] leading-relaxed flex-1">
                          {q.text}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="text-xs text-[#6B6B6B] whitespace-nowrap">
                            [{q.marks} Marks]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <hr className="border-[#E5E5E5] mb-4" />
          <p className="text-center text-xs text-[#6B6B6B] font-medium mb-6">
            End of Question Paper
          </p>

          {/* Answer Key */}
          <div>
            <h3 className="text-sm font-bold text-[#111111] mb-3">
              Answer Key:
            </h3>
            <div className="flex flex-col gap-2">
              {currentResult.sections
                .flatMap((s) => s.questions)
                .map((q, i) => (
                  <p key={i} className="text-xs text-[#6B6B6B] leading-relaxed">
                    <span className="font-medium text-[#111111]">
                      {q.questionNumber}.
                    </span>{" "}
                    {q.answer}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
