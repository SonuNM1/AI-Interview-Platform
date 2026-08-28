import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

const candidateInterviewProxy = createProxyMiddleware({
  target: services.interview,
  changeOrigin: true,

  // Forward the candidate request to the Interview Service

  pathRewrite: () => `/api/v1/interviews/candidate`,
});

// Get interviews assigned to the authenticated candidate.
router.get(
  "/",
  authenticate,
  authorize("CANDIDATE"),
  candidateInterviewProxy,
);

export default router;