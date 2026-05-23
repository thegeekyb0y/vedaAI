import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const assignmentQueue = new Queue("assignments", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export const addGenerationJob = async (assignmentId: string): Promise<void> => {
  await assignmentQueue.add("generate", { assignmentId });
};
