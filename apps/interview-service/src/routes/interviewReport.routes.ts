import { Router } from "express";
import { generateInterviewReport } from "../controllers/interviewReport.controller.js";

const router = Router() ; 

router.get("/:accessToken", generateInterviewReport) ; 

export default router;  