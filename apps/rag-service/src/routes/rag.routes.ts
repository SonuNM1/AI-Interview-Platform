import { Router } from "express";
import { searchDocumentsController } from "../controllers/rag.controller.js";

const router = Router();

// Semantic Search

router.post("/search", searchDocumentsController);

export default router;