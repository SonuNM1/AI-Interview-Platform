import { Router } from "express";

import {
  getMockInterviewReportController,
} from "../controllers/report.controller.js";

const router = Router();

// Get final mock interview report

router.get("/:id/report", getMockInterviewReportController);


export default router;