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

export interface IPaperMeta {
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
  dueDate: Date;
  questionTypes: IQuestionTypeInput[];
  additionalInstructions?: string;
  fileUrl?: string;
  paperMeta?: IPaperMeta;
  status: AssignmentStatus;
  result?: IGeneratedPaper;
  createdAt: Date;
  updatedAt: Date;
}
