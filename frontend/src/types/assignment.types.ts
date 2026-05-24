export type Difficulty = "Easy" | "Moderate" | "Challenging";
export type AssignmentStatus = "pending" | "processing" | "done" | "failed";

export interface IQuestionTypeInput {
  type: string;
  noOfQuestions: number;
  marks: number;
}

export interface IQuestion {
  questionNumber: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer: string;
}

export interface ISection {
  title: string;
  instruction: string;
  totalMarks: number;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  sections: ISection[];
}

export interface PaperMeta {
  schoolName: string;
  subject: string;
  className: string;
  section: string;
  timeAllowed: string;
  maxMarks: string;
  instructions: string;
}

export interface IAssignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypes: IQuestionTypeInput[];
  additionalInstructions?: string;
  fileUrl?: string;
  paperMeta?: PaperMeta;
  status: AssignmentStatus;
  result?: IGeneratedPaper;
  createdAt: string;
  updatedAt: string;
}
