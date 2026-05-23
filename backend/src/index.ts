import "./config/env";
import { env } from "./config/env";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./config/db";
import assignmentRoutes from "./routes/assignment.route";
import uploadRoutes from "./routes/upload.route";
import { errorHandler } from "./middlewares/errorHandler";
import "./queues/assignmentWorker";
import { redis } from "./config/redis";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Socket
io.on("connection", (socket) => {
  socket.on("join", (assignmentId: string) => {
    socket.join(assignmentId);
  });
});

// // Error handler — always last
app.use(errorHandler);

// Boot
const start = async () => {
  await connectDB();
  await redis.ping(); // confirms redis is connected before starting
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();
