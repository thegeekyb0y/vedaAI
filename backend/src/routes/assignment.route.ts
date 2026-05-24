import { Router, Request, Response } from "express";
import { Assignment } from "../models/Assignment";
import { addGenerationJob } from "../queues/assignmentQueue";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

// POST /api/assignments — create + queue job
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      title,
      dueDate,
      questionTypes,
      additionalInstructions,
      fileUrl,
      paperMeta, // ← added
    } = req.body;

    const assignment = await Assignment.create({
      title,
      dueDate,
      questionTypes,
      additionalInstructions,
      fileUrl,
      paperMeta, // ← added
    });

    await addGenerationJob(assignment._id.toString());

    res.status(201).json(assignment);
  }),
);

// GET /api/assignments — list all, exclude result field
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const assignments = await Assignment.find()
      .select("-result")
      .sort({ createdAt: -1 });
    res.json(assignments);
  }),
);

// GET /api/assignments/:id — single with result
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, message: "Assignment not found" });
      return;
    }
    res.json(assignment);
  }),
);

// DELETE /api/assignments/:id
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }),
);

// POST /api/assignments/:id/regenerate
router.post(
  "/:id/regenerate",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: "pending", result: null },
      { new: true },
    );

    if (!assignment) {
      res.status(404).json({ success: false, message: "Assignment not found" });
      return;
    }

    await addGenerationJob(assignment._id.toString());
    res.json(assignment);
  }),
);

export default router;
