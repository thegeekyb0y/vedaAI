import { Router, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Use memory storage — buffer goes straight to Cloudinary, nothing hits disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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

    // Upload buffer to Cloudinary
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "veda-uploads" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      },
    );

    res.status(201).json({ fileUrl: result.secure_url });
  }),
);

export default router;
