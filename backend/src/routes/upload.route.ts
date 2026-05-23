import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF and images are allowed"));
  },
});

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    res.status(201).json({
      fileUrl: `/uploads/${req.file.filename}`,
    });
  }),
);

export default router;
