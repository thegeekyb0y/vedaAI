import "./config/env";
import { env } from "./config/env";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./config/db";
import assignmentRoutes from "./routes/assignment.route";
import uploadRoutes from "./routes/upload.route";
import pdfRoutes from "./routes/pdf.route"; // ← NEW
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_URL, methods: ["GET", "POST"] },
});

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/assignments", assignmentRoutes);
app.use("/api/assignments", pdfRoutes); // ← NEW
app.use("/api", uploadRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  socket.on("join", (assignmentId: string) => {
    socket.join(assignmentId);
  });
});

app.use(errorHandler);

if (process.env.RUN_ASSIGNMENT_WORKER === "true") {
  void import("./queues/assignmentWorker");
}

const start = async () => {
  await connectDB();
  httpServer.listen(parseInt(env.PORT, 10), "0.0.0.0", () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

void start();

export default app;
