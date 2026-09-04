import { Router } from "express";
import multer from "multer"
import { getResumeDocument, uploadDocument } from "../controllers/document.controller.js";

const router = Router();

// Store uploaded PDFs temporarily.

const upload = multer({
  dest: "uploads/",
});

// Upload a PDF document.

router.post("/upload", upload.single("file"), uploadDocument);

// Get the RAG document generated from an existing uploaded resume

router.get("/document/resume/:fileId", getResumeDocument);

export default router;