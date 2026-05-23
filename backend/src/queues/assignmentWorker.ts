import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { Assignment } from "../models/Assignment";
import { generatePaper } from "../services/ai.service";
import { io } from "../index";

const processJob = async (job: Job): Promise<void> => {
  const { assignmentId } = job.data;

  await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });
  io.to(assignmentId).emit("job:status", { status: "processing" });

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

  const result = await generatePaper(assignment);

  await Assignment.findByIdAndUpdate(assignmentId, {
    status: "done",
    result,
  });

  io.to(assignmentId).emit("job:status", { status: "done", result });
};

const worker = new Worker("assignments", processJob, {
  connection: redis,
  concurrency: 2,
});

worker.on("failed", async (job, err) => {
  if (!job) return;
  const { assignmentId } = job.data;
  await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });
  io.to(assignmentId).emit("job:status", { status: "failed" });
  console.error(`Job ${job.id} failed:`, err.message);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});
