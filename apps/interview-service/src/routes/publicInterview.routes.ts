import { Router } from "express";
import { getPublicInterview, startInterview } from "../controllers/publicInterview.controller.js";

const router = Router();

// Candidate accesses interview using secure access token.

router.get("/:accessToken", getPublicInterview);

router.post("/:accessToken/start", startInterview);

export default router;