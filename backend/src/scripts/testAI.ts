import "../config/env";
import { generatePaper } from "../services/ai.service";

const mockAssignment = {
  questionTypes: [
    { type: "Multiple Choice Questions", noOfQuestions: 3, marks: 1 },
    { type: "Short Answer Questions", noOfQuestions: 2, marks: 2 },
  ],
  additionalInstructions: "Focus on photosynthesis and plant biology.",
} as any;

const run = async () => {
  console.log("Generating paper...");
  try {
    const result = await generatePaper(mockAssignment);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Failed:", err);
  }
};

run();
