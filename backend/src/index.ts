import "./config/env";
import { env } from "./config/env";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./config/db";
import assignmentRoutes from "./routes/assignment.route";
import uploadRoutes from "./routes/upload.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Socket
io.on("connection", (socket) => {
  socket.on("join", (assignmentId: string) => {
    socket.join(assignmentId);
  });
});

// Error handler — must be last
app.use(errorHandler);

// Worker — only when explicitly enabled via env flag
if (process.env.RUN_ASSIGNMENT_WORKER === "true") {
  void import("./queues/assignmentWorker");
}

// ✅ Unconditional — binds on 0.0.0.0 for Render
const start = async () => {
  await connectDB();
  httpServer.listen(parseInt(env.PORT, 10), "0.0.0.0", () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

void start();

export default app;
