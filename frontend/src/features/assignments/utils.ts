import { AssignmentStatus, IGeneratedPaper } from "@/types/assignment.types";

export const formatAssignmentDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const getAssignmentTotals = (paper?: IGeneratedPaper | null) => {
  const sections = paper?.sections ?? [];

  const totalMarks = sections.reduce((sum, section) => sum + section.totalMarks, 0);
  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );

  return { totalMarks, totalQuestions };
};

export const isAssignmentActive = (status?: AssignmentStatus) =>
  status === "pending" || status === "processing";
