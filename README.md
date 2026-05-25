# VedaAI — AI-Powered Assessment Creator

> Generate professional, print-ready exam question papers in seconds using AI. Built for educators.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Full Request Flow](#full-request-flow)
- [Project Structure](#project-structure)
- [Security & Validation](#security--validation)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Best Practices Applied](#best-practices-applied)

---

## Overview

VedaAI lets teachers create fully-structured exam papers by specifying a subject, question types, marks, and optional reference material. The AI generates questions, answers, and a difficulty-distributed paper — downloadable as a formatted PDF.

**Core capabilities:**

- Multi-section exam paper generation (MCQ, Short Answer, Long Answer, etc.)
- Real-time generation status via WebSockets with polling fallback
- Downloadable, print-ready PDF with answer key
- File upload (syllabus/notes) as AI context via Cloudinary
- Background job queue so the HTTP response is never blocked by AI generation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                      │
│                                                             │
│  Create Form → REST API call → Poll / Socket listener       │
│       ↓                              ↑                      │
│  Assignment Detail Page      job:status event (Socket.IO)   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Express + TypeScript)           │
│                                                             │
│  Routes → asyncHandler → Mongoose (MongoDB)                 │
│       ↓                                                     │
│  BullMQ Queue (Redis) ──► Worker Process                    │
│                                  ↓                          │
│                          Groq API (LLaMA 3.3 70B)           │
│                                  ↓                          │
│                     Assignment saved → Socket.IO emit       │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
     MongoDB Atlas              Redis (BullMQ)
   (Assignments store)       (Job queue + state)
```

### Worker Separation

The assignment worker (`assignmentWorker.ts`) is conditionally loaded via the `RUN_ASSIGNMENT_WORKER` environment variable. This allows deploying the API server and worker as separate processes or containers, keeping concerns isolated and enabling independent scaling.

---

## Tech Stack

| Layer                    | Technology                     | Purpose                                |
| ------------------------ | ------------------------------ | -------------------------------------- |
| **Frontend**             | Next.js 16 (App Router)        | SSR-ready React framework              |
| **Styling**              | Tailwind CSS v4                | Utility-first styling                  |
| **State**                | Zustand                        | Lightweight global store               |
| **Forms**                | React Hook Form + Zod          | Type-safe form handling and validation |
| **HTTP Client**          | Axios                          | API calls with progress tracking       |
| **Real-time**            | Socket.IO Client               | Live job status updates                |
| **Backend**              | Express 5 + TypeScript         | REST API server                        |
| **Database**             | MongoDB via Mongoose           | Assignment persistence                 |
| **Job Queue**            | BullMQ                         | Background AI generation jobs          |
| **Cache / Queue Broker** | Redis (ioredis)                | BullMQ transport layer                 |
| **AI Model**             | Groq (LLaMA 3.3 70B Versatile) | Exam paper generation                  |
| **Output Validation**    | Zod + jsonrepair               | Parse and validate AI JSON output      |
| **File Storage**         | Cloudinary                     | Reference file upload (PDF/images)     |
| **PDF Generation**       | PDFKit                         | Server-side PDF creation               |
| **WebSockets**           | Socket.IO                      | Bi-directional job status push         |
| **Dev Server**           | ts-node-dev                    | Hot-reload TypeScript development      |

---

## Full Request Flow

### 1. Assignment Creation

```
User fills StepOne (question types, marks, file)
    → File uploaded to Cloudinary via /api/upload (multer memory storage)
    → fileUrl returned and stored in form state

User fills StepTwo (school name, class, subject, meta)
    → POST /api/assignments
        → Assignment document created in MongoDB (status: "pending")
        → addGenerationJob() pushes job ID to BullMQ Redis queue
        → 201 response returned immediately (non-blocking)

User is redirected to /assignments/:id
    → Frontend fetches full assignment record
    → Socket.IO joins room = assignmentId
    → Polling fallback starts (every 4s) if socket hasn't resolved status
```

### 2. Background Generation

```
BullMQ Worker picks up job
    → Assignment status set to "processing"
    → Socket.IO emits job:status { status: "processing" } to room
    → generatePaper() called:
        → Builds structured prompt with topic, question types, marks
        → Groq API call (LLaMA 3.3 70B, response_format: json_object)
        → Raw JSON response cleaned and parsed
        → Zod schema validates structure
        → jsonrepair used as fallback for malformed JSON
        → Questions enriched with sequential numbering and section totals
    → Assignment updated: status "done", result saved
    → Socket.IO emits job:status { status: "done", result }

Worker failure:
    → BullMQ retries up to 3 times (exponential backoff: 1s base)
    → On final failure: status set to "failed", socket notified
```

### 3. PDF Download

```
GET /api/assignments/:id/pdf
    → Assignment fetched from MongoDB
    → PDFKit document streamed directly to response
    → Header block: school, subject, class, time, marks, instructions
    → Per-section rendering:
        → MCQ: 2-column option grid with (A)(B)(C)(D) layout
        → Non-MCQ: inline marks label, full-width text
    → Answer key appended on a new page
    → PDF piped to res (no temp file on disk)
```

---

## Project Structure

```
vedaai/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── db.ts           # Mongoose connection
│       │   ├── env.ts          # Zod-validated env schema
│       │   └── redis.ts        # ioredis client (TLS-aware)
│       ├── middlewares/
│       │   ├── asyncHandler.ts # Wraps async routes, forwards errors
│       │   └── errorHandler.ts # Global Express error handler
│       ├── models/
│       │   └── Assignment.ts   # Mongoose schema + document interface
│       ├── queues/
│       │   ├── assignmentQueue.ts   # BullMQ Queue definition
│       │   └── assignmentWorker.ts  # BullMQ Worker (conditionally loaded)
│       ├── routes/
│       │   ├── assignment.route.ts  # CRUD routes
│       │   ├── pdf.route.ts         # PDF generation route
│       │   └── upload.route.ts      # Cloudinary file upload
│       ├── services/
│       │   └── ai.service.ts   # Groq prompt, parse, validate, enrich
│       └── types/
│           └── assignment.types.ts  # Shared TypeScript interfaces
│
└── frontend/
    └── src/
        ├── app/                # Next.js App Router pages
        ├── components/
        │   ├── assignments/    # Paper, Card, StepOne, StepTwo, etc.
        │   ├── layout/         # Sidebar, Topbar
        │   └── ui/             # Button, Counter, FileUpload, Spinner
        ├── features/assignments/
        │   ├── api.ts          # Axios calls
        │   ├── constants.ts    # Question types, poll interval
        │   ├── form-schema.ts  # Zod schema with date normalization
        │   └── utils.ts        # Date formatting, totals, status check
        ├── hooks/
        │   └── useAssignmentSocket.ts  # Socket.IO subscription hook
        ├── store/
        │   └── assignmentStore.ts      # Zustand global state
        └── types/
            └── assignment.types.ts     # Shared frontend types
```

---

## Security & Validation

### Environment Variables

All environment variables are validated at startup using a **Zod schema** (`src/config/env.ts`). The server exits immediately with a descriptive error if any required variable is missing or malformed — no silent failures.

```typescript
const envSchema = z.object({
  MONGO_URI: z.string(),
  REDIS_URL: z.string(),
  GROQ_API_KEY: z.string(),
  // ...
});
```

### Input Validation (Backend)

- All route inputs pass through Mongoose schema validation before being persisted.
- File uploads are validated by **MIME type allowlist** (`application/pdf`, `image/jpeg`, `image/png`) in Multer's `fileFilter` — extension spoofing is rejected.
- File size is capped at **10MB** server-side.
- Files are processed **in-memory only** (Multer `memoryStorage`) — nothing touches the server's disk before being streamed to Cloudinary.

### Input Validation (Frontend)

- All form fields are validated with **Zod** before submission via React Hook Form.
- Due dates are normalized using a locale-safe parser that handles `YYYY-MM-DD`, `DD-MM-YYYY`, and slash-separated formats, then verified to be non-past before sending.
- The Zod schema `transform()` step converts the date string to a clean ISO string before it leaves the client.

### AI Output Validation

AI responses are untrusted by default. The pipeline applies three layers of defense:

1. `response_format: { type: "json_object" }` — instructs Groq to return valid JSON only.
2. **jsonrepair** — attempts to fix common LLM JSON issues (trailing commas, unquoted keys) before parsing.
3. **Zod schema parse** — enforces the exact structure (`sections → questions → text/difficulty/marks/answer`) with strict enum validation on `difficulty`.

If any layer fails, the job throws, BullMQ retries up to 3 times, and ultimately marks the assignment as `"failed"`.

### PDF Generation

- Assignment title is sanitized with a regex (`/[^a-z0-9\s-]/gi`) before use in the `Content-Disposition` filename header, preventing header injection.
- PDF is streamed directly via `doc.pipe(res)` — no temp files are written.

### CORS

CORS is configured with an explicit `CLIENT_URL` origin allowlist — wildcard origins are not used.

### Error Handling

All async route handlers are wrapped in `asyncHandler` which forwards thrown errors to Express's centralized `errorHandler` middleware. No raw stack traces are leaked to API consumers.

---

## Local Development

### Prerequisites

- Node.js >= 20
- MongoDB (local or Atlas)
- Redis (local or Upstash/Redis Cloud)
- Groq API key — [console.groq.com](https://console.groq.com)
- Cloudinary account

### 1. Clone and install

```bash
git clone https://github.com/your-org/vedaai.git
cd vedaai

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# In /backend, copy the example and fill in your values
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for all required keys.

### 3. Run the backend

The API server and the worker can run as a single process locally:

```bash
cd backend
RUN_ASSIGNMENT_WORKER=true npm run dev
```

Or run them separately in two terminals:

```bash
# Terminal 1 — API server only
npm run dev

# Terminal 2 — Worker only
RUN_ASSIGNMENT_WORKER=true npm run dev
```

### 4. Run the frontend

```bash
cd frontend
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev
```

The app is available at `http://localhost:3000`.

### 5. Build for production

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                | Required | Description                                            |
| ----------------------- | -------- | ------------------------------------------------------ |
| `PORT`                  | No       | HTTP port (default: `4000`)                            |
| `MONGO_URI`             | Yes      | MongoDB connection string                              |
| `REDIS_URL`             | Yes      | Redis connection string (supports `rediss://` for TLS) |
| `GROQ_API_KEY`          | Yes      | Groq API key for LLaMA inference                       |
| `CLIENT_URL`            | Yes      | Frontend origin for CORS and Socket.IO                 |
| `CLOUDINARY_CLOUD_NAME` | Yes      | Cloudinary cloud name                                  |
| `CLOUDINARY_API_KEY`    | Yes      | Cloudinary API key                                     |
| `CLOUDINARY_API_SECRET` | Yes      | Cloudinary API secret                                  |
| `RUN_ASSIGNMENT_WORKER` | No       | Set to `"true"` to start the BullMQ worker in-process  |

### Frontend (`frontend/.env.local`)

| Variable              | Required | Description                                      |
| --------------------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend base URL (e.g. `https://api.vedaai.com`) |

---

## Best Practices Applied

### Backend

- **Async error propagation** — `asyncHandler` wraps every route; no unhandled promise rejections in route handlers.
- **Graceful job retries** — BullMQ configured with 3 attempts and exponential backoff; failed jobs emit socket events and update DB status atomically.
- **Non-blocking API** — The POST `/assignments` endpoint returns in milliseconds; AI generation happens entirely in the background worker.
- **Lazy queue import** — `assignmentQueue` is dynamically imported inside route handlers so Redis is only connected when needed, not on every cold start.
- **Streamed PDF** — PDFKit pipes directly to the HTTP response; no intermediate file on disk, no memory buffer for large documents.
- **In-memory file handling** — Multer uses `memoryStorage`; uploaded files never hit the server filesystem.
- **TLS-aware Redis** — `ioredis` client detects `rediss://` scheme and enables TLS automatically.
- **Structured logging** — Errors logged with method, path, status code, and message for easy debugging.

### Frontend

- **Optimistic socket + polling fallback** — Socket.IO provides instant updates; a 4-second polling loop acts as a safety net if the socket connection drops.
- **Store seeding with caution** — The detail page only seeds from the Zustand store if the stored record already has `result`, preventing a stale-data flash on first load.
- **Type-safe API layer** — All API functions are fully typed; response shapes match the shared `IAssignment` interface.
- **Progressive upload UX** — File upload shows a live progress bar via Axios `onUploadProgress`.
- **Locale-safe date parsing** — The form schema handles `YYYY-MM-DD`, `DD-MM-YYYY`, and `/`-separated formats across browser locales before validating and transforming to ISO 8601.
- **Print support** — `print-hidden` utility class hides nav, sidebar, and action buttons for clean paper printing; `body` background is overridden to `#ffffff` in print media.
- **Responsive layout** — Two distinct layouts (mobile/desktop) within the same component tree, driven by `useIsMobile` and Tailwind breakpoints.

That's all for this project. Thankyou 💛
