import { DifficultyBadge } from "@/components/assignments/DifficultyBadge";
import { formatAssignmentDate, getAssignmentTotals } from "@/features/assignments/utils";
import { IAssignment, IQuestion, ISection } from "@/types/assignment.types";

interface AssignmentPaperProps {
  assignment: IAssignment;
}

const PaperQuestion = ({ question }: { question: IQuestion }) => (
  <div className="rounded-[22px] border border-(--color-border) bg-(--color-surface-raised) p-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex gap-3">
        <span className="mt-0.5 min-w-6 text-sm font-semibold text-(--color-primary)">
          {question.questionNumber}.
        </span>
        <p className="text-sm leading-7 text-(--color-primary)">{question.text}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <DifficultyBadge difficulty={question.difficulty} />
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-(--color-secondary) shadow-(--shadow-soft)">
          {question.marks} marks
        </span>
      </div>
    </div>
  </div>
);

const PaperSection = ({ section }: { section: ISection }) => (
  <section className="space-y-4 rounded-[30px] border border-(--color-border) bg-white p-5 shadow-(--shadow-soft) sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-(--color-primary)">{section.title}</h2>
        <p className="mt-2 text-sm leading-6 text-(--color-secondary)">
          {section.instruction}
        </p>
      </div>
      <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface-raised) px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
        {section.totalMarks} marks
      </span>
    </div>

    <div className="space-y-3">
      {section.questions.map((question) => (
        <PaperQuestion
          key={`${section.title}-${question.questionNumber}`}
          question={question}
        />
      ))}
    </div>
  </section>
);

export const AssignmentPaper = ({ assignment }: AssignmentPaperProps) => {
  const paper = assignment.result;

  if (!paper) return null;

  const { totalMarks, totalQuestions } = getAssignmentTotals(paper);

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] bg-(--color-primary) p-6 text-white shadow-[0_30px_60px_rgba(17,17,17,0.22)] sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
          AI Output
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {assignment.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
          Your assignment has been generated and grouped into structured sections
          with difficulty labels, marks, and answer guidance for each question.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/60">Due Date</p>
            <p className="mt-2 text-sm font-semibold">{formatAssignmentDate(assignment.dueDate)}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/60">Sections</p>
            <p className="mt-2 text-sm font-semibold">{paper.sections.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/60">Questions</p>
            <p className="mt-2 text-sm font-semibold">{totalQuestions}</p>
          </div>
        </div>
      </section>

      <section
        id="paper"
        className="rounded-[36px] border border-(--color-border) bg-white p-5 shadow-(--shadow-card) sm:p-8"
      >
        <div className="border-b border-dashed border-(--color-border) pb-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-(--color-orange)">
            Generated Assignment Paper
          </p>
          <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-(--color-primary)">
            {assignment.title}
          </h2>
          <div className="mt-5 flex flex-col gap-3 text-sm text-(--color-secondary) sm:flex-row sm:items-center sm:justify-between">
            <span>Due date: {formatAssignmentDate(assignment.dueDate)}</span>
            <span>Total marks: {totalMarks}</span>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-(--color-secondary) sm:grid-cols-3">
            <div className="rounded-[18px] bg-(--color-surface-raised) px-4 py-3">Name: ____________________</div>
            <div className="rounded-[18px] bg-(--color-surface-raised) px-4 py-3">Roll No: ____________________</div>
            <div className="rounded-[18px] bg-(--color-surface-raised) px-4 py-3">Section: ____________________</div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {paper.sections.map((section) => (
            <PaperSection key={section.title} section={section} />
          ))}
        </div>

        <section className="mt-6 rounded-[30px] border border-(--color-border) bg-(--color-surface-raised) p-5">
          <h3 className="text-lg font-semibold text-(--color-primary)">Answer Key</h3>
          <div className="mt-4 space-y-3">
            {paper.sections.flatMap((section) => section.questions).map((question, index) => (
              <div
                key={`answer-${question.questionNumber}-${index}`}
                className="rounded-[20px] bg-white px-4 py-3 shadow-(--shadow-soft)"
              >
                <p className="text-sm leading-6 text-(--color-secondary)">
                  <span className="font-semibold text-(--color-primary)">
                    {question.questionNumber}.
                  </span>{" "}
                  {question.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};
