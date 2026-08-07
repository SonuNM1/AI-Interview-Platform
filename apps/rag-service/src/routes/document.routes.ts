import { Router } from "express";
import multer from "multer"
import { uploadDocument } from "../controllers/document.controller.js";

const router = Router();

// Store uploaded PDFs temporarily.

const upload = multer({
  dest: "uploads/",
});

// Upload a PDF document.

router.post("/upload", upload.single("file"), uploadDocument);

export default router;