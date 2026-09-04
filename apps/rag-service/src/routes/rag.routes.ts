import { Router } from "express";
import { searchDocumentsController, searchDocumentsStreamController } from "../controllers/rag.controller.js";

const router = Router();

// Semantic Search

router.post("/search", searchDocumentsController); 

router.post("/search/stream", searchDocumentsStreamController)

export default router;