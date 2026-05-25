import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "../config/env";
import { IAssignmentDocument } from "../models/Assignment";
import { jsonrepair } from "jsonrepair";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// ---- Zod output schema ----
// ---- Zod output schema ----
const QuestionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]),
  marks: z.number(),
  answer: z.string(),
});

const SectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema),
});

const PaperSchema = z.object({
  sections: z.array(SectionSchema),
});

export type GeneratedPaper = z.infer<typeof PaperSchema>;

// Enriched types computed after parsing
export interface Question {
  questionNumber: number;
  text: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
  answer: string;
}

export interface Section {
  title: string;
  instruction: string;
  totalMarks: number;
  questions: Question[];
}

export interface GeneratedPaperEnriched {
  sections: Section[];
}

// ---- Enrich parsed paper ----
const enrichPaper = (
  paper: z.infer<typeof PaperSchema>,
): GeneratedPaperEnriched => {
  let counter = 1;
  return {
    sections: paper.sections.map((section) => ({
      title: section.title,
      instruction: section.instruction,
      totalMarks: section.questions.reduce((sum, q) => sum + q.marks, 0),
      questions: section.questions.map((q) => ({
        ...q,
        questionNumber: counter++,
      })),
    })),
  };
};

// ---- Prompt builder ----
const buildPrompt = (assignment: IAssignmentDocument): string => {
  const typesList = assignment.questionTypes
    .map(
      (qt) =>
        `- ${qt.noOfQuestions} ${qt.type} question(s), each worth ${qt.marks} mark(s)`,
    )
    .join("\n");

  return `Generate a complete exam question paper and return it as a JSON object.

The JSON must follow this EXACT structure — no other structure is acceptable:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "text": "Question content here",
          "difficulty": "Easy",
          "marks": 1,
          "answer": "Answer here"
        }
      ]
    }
  ]
}

TOPIC / SUBJECT CONTEXT (most important — ALL questions must be strictly based on this):
${assignment.additionalInstructions || "General knowledge"}

Question Types to include:
${typesList}

Rules:
- Every question MUST be directly relevant to the topic above. Never go off-topic.
- For "Multiple Choice Questions": embed exactly 4 options inside the text field on new lines using this exact format:
  "Question stem here?\n(a) First option\n(b) Second option\n(c) Third option\n(d) Fourth option"
  The answer field must state the correct option and briefly explain why, e.g. "(b) Photosystem II — because it contains the oxygen-evolving complex."
- For all other question types: text is just the question, answer is a clear 2–3 sentence explanation.
- Use EXACTLY the field names: sections, title, instruction, questions, text, difficulty, marks, answer
- difficulty must be exactly one of: "Easy", "Moderate", "Challenging"
- Group questions by type into separate sections (Section A, Section B, etc.)
- Each section must have a clear instruction line
- Distribute difficulty: roughly 40% Easy, 40% Moderate, 20% Challenging
- Return ONLY the JSON object, nothing else`;
};

// ---- JSON parser with safety ----
const parseJSON = (raw: string): GeneratedPaperEnriched => {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = JSON.parse(jsonrepair(cleaned));
  }

  const validated = PaperSchema.parse(parsed);
  return enrichPaper(validated);
};

// ---- Main export ----
export const generatePaper = async (
  assignment: IAssignmentDocument,
): Promise<GeneratedPaperEnriched> => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    max_tokens: 4000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert exam paper generator. You MUST return a JSON object with a top-level 'sections' array. Each section has 'title', 'instruction', and 'questions'. Each question has 'text', 'difficulty', 'marks', and 'answer'. No other structure is acceptable.
          
          STRICT RULES:
- Every question must be 100% relevant to the given topic. Never generate off-topic questions.
- Answers must be precise, factually correct, and detailed — not vague or one-word.
- For conceptual questions: answers should be 2-3 sentences explaining the concept clearly.
- For MCQs: provide the correct option AND a brief reason why it is correct.
- For numerical/diagram questions: provide step-by-step solutions.
- Questions should test real understanding, not just memorization.
- Always return valid JSON matching the exact structure requested. Nothing else.`,
      },
      {
        role: "user",
        content: buildPrompt(assignment),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;

  if (!raw) {
    throw new Error("Groq returned an empty response");
  }

  return parseJSON(raw);
};
