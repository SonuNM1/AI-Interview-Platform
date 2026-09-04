import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router: Router = Router();

const mockInterviewProxy = createProxyMiddleware({
  target: services.mockInterview,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1/mock-interviews${path}`,
});

// Create a new mock interview using the candidate's resume.

router.post(
  "/",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Get the candidate's previous mock interviews This route must come before "/:id" so "history" is not treated as an ID.

router.get(
  "/history",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Start mock interview and generate the first question.

router.post(
  "/:id/start",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Submit audio answer for the current question.

router.post(
  "/:id/answer",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Skip the current question and record it as 0/10.

router.post(
  "/:id/skip",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Manually end the mock interview and generate its report.

router.post(
  "/:id/end",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Get a specific mock interview with its questions and report.

router.get(
  "/:id",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Get the final report for a completed mock interview.

router.get(
  "/:id/report",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

export default router;