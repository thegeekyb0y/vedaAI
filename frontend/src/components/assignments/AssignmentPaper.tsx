"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getAssignmentTotals } from "@/features/assignments/utils";
import { IAssignment, IQuestion, ISection } from "@/types/assignment.types";

interface AssignmentPaperProps {
  assignment: IAssignment;
}

interface MCQParsed {
  questionText: string;
  options: Array<{ label: string; text: string }>;
}

function parseMCQOptions(text: string): MCQParsed | null {
  const aIdx = text.search(/\(a\)/i);
  if (aIdx === -1) return null;
  const questionText = text.slice(0, aIdx).trim();
  const matches = [...text.matchAll(/\(([a-d])\)\s*([^(\n]+)/gi)];
  if (matches.length < 2) return null;
  return {
    questionText,
    options: matches.map((m) => ({
      label: (m[1] ?? "").toUpperCase(),
      text: (m[2] ?? "").trim(),
    })),
  };
}

const PaperQuestion = ({
  question,
  globalNumber,
}: {
  question: IQuestion;
  globalNumber: number;
}) => {
  const mcq = parseMCQOptions(question.text);

  return (
    <li value={globalNumber} className="text-[15px] leading-7 text-primary">
      <span className="font-medium">[{question.difficulty}]</span>{" "}
      {mcq ? (
        <span>
          {mcq.questionText}{" "}
          <span className="text-secondary text-[13px]">
            [{question.marks} Marks]
          </span>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 pl-2 text-[14px] text-primary">
            {mcq.options.map((opt) => (
              <span key={opt.label}>
                <span className="font-medium">({opt.label})</span> {opt.text}
              </span>
            ))}
          </div>
        </span>
      ) : (
        <span>
          {question.text}{" "}
          <span className="text-secondary text-[13px]">
            [{question.marks} Marks]
          </span>
        </span>
      )}
    </li>
  );
};

const PaperSection = ({
  section,
  startNumber,
}: {
  section: ISection;
  startNumber: number;
}) => (
  <section className="mt-10">
    <h3 className="text-center text-[22px] font-semibold text-primary">
      {section.title}
    </h3>
    <div className="mt-8">
      <h4 className="text-[16px] font-semibold text-primary">
        {section.instruction}
      </h4>
      <p className="mt-1 text-[14px] italic text-primary/75">
        Attempt all questions. Each question carries{" "}
        {section.questions[0]?.marks ?? 0} marks
      </p>
    </div>
    <ol
      start={startNumber}
      className="mt-6 list-decimal space-y-4 pl-6 marker:text-primary"
    >
      {section.questions.map((question, i) => (
        <PaperQuestion
          key={`${section.title}-${question.questionNumber}`}
          question={question}
          globalNumber={startNumber + i}
        />
      ))}
    </ol>
  </section>
);

export const AssignmentPaper = ({ assignment }: AssignmentPaperProps) => {
  const paper = assignment.result;
  const meta = assignment.paperMeta;

  if (!paper) return null;

  const { totalMarks } = getAssignmentTotals(paper);

  const sectionStarts: number[] = [];
  let counter = 1;
  for (const section of paper.sections) {
    sectionStarts.push(counter);
    counter += section.questions.length;
  }

  const handleDownloadPdf = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assignments/${assignment._id}/pdf`,
      "_blank",
    );
  };

  return (
    <div className="space-y-5">
      {/* AI intro card */}
      <section className="rounded-[34px] bg-[#272727] px-7 py-8 text-white shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <p className="max-w-4xl text-[18px] font-semibold leading-8">
          Here is your customized question paper for{" "}
          <span className="text-orange-400">{assignment.title}</span> based on
          the uploaded requirements:
        </p>
        <Button
          variant="secondary"
          className="mt-6 h-12 rounded-full border-0 bg-white px-5 text-[16px] font-medium text-primary hover:bg-white"
          iconLeft={<Download size={16} />}
          onClick={handleDownloadPdf}
        >
          Download as PDF
        </Button>
      </section>

      {/* Paper preview */}
      <section className="rounded-[34px] bg-white px-7 py-9 text-primary shadow-[0_20px_40px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[28px] font-semibold leading-tight text-primary">
            {meta?.schoolName || "—"}
          </h1>
          <p className="mt-2 text-[22px] font-semibold text-primary">
            Subject: {meta?.subject || assignment.title}
          </p>
          <p className="mt-1 text-[22px] font-semibold text-primary">
            Class: {meta?.className || "—"}
          </p>
        </div>

        {/* Time + Marks */}
        <div className="mt-12 flex items-start justify-between gap-6 text-[18px] font-semibold text-primary">
          <p>Time Allowed: {meta?.timeAllowed || "—"}</p>
          <p>Maximum Marks: {meta?.maxMarks || totalMarks}</p>
        </div>

        {/* Instructions */}
        {meta?.instructions && (
          <p className="mt-8 text-[18px] font-semibold text-primary">
            {meta.instructions}
          </p>
        )}

        {/* Student fields */}
        <div className="mt-8 space-y-2 text-[18px] font-semibold text-primary">
          <p>Name: ________________</p>
          <p>Roll Number: ________________</p>
          <p>
            Class: {meta?.className || "—"}&nbsp;&nbsp; Section:{" "}
            {meta?.section || "________________"}
          </p>
        </div>

        {/* Sections */}
        {paper.sections.map((section, i) => (
          <PaperSection
            key={section.title}
            section={section}
            startNumber={sectionStarts[i] ?? 1}
          />
        ))}

        <p className="mt-8 text-[16px] font-semibold text-primary">
          — End of Question Paper —
        </p>

        {/* Answer key */}
        <section className="mt-14">
          <h3 className="text-[28px] font-semibold text-primary">Answer Key</h3>
          <ol className="mt-6 list-decimal space-y-4 pl-6 marker:text-primary">
            {paper.sections
              .flatMap((s) => s.questions)
              .map((question, index) => (
                <li
                  key={`answer-${question.questionNumber}-${index}`}
                  className="text-[15px] leading-8 text-primary"
                >
                  {question.answer}
                </li>
              ))}
          </ol>
        </section>
      </section>
    </div>
  );
};
