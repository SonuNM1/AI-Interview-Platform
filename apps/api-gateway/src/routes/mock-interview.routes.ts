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

// Create mock interview

router.post(
  "/",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Start mock interview

router.post(
  "/:id/start",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Submit audio answer
router.post(
  "/:id/answer",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Get mock interview
router.get(
  "/:id",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

// Get final report
router.get(
  "/:id/report",
  authenticate,
  authorize("CANDIDATE"),
  mockInterviewProxy,
);

export default router;