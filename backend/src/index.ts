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

// DB middleware — MongoDB only, no Redis on every request
let isConnected = false;
const middlewareDBCheck = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await middlewareDBCheck();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Socket
io.on("connection", (socket) => {
  socket.on("join", (assignmentId: string) => {
    socket.join(assignmentId);
  });
});

// Error handler — must be after routes
app.use(errorHandler);

// Worker — only in non-production or when explicitly enabled
if (
  process.env.NODE_ENV !== "production" ||
  process.env.RUN_ASSIGNMENT_WORKER === "true"
) {
  void import("./queues/assignmentWorker");
}

// Local dev HTTP listener
if (process.env.NODE_ENV !== "production") {
  const start = async () => {
    await connectDB();
    try {
      const { redis } = await import("./config/redis");
      await redis.ping();
      console.log("Redis connection established.");
    } catch (err) {
      console.error("Redis warning:", err);
    }
    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  };
  void start();
}

export default app;
