import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

const interviewProxy = createProxyMiddleware({
  target: services.interview,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1/interviews${path}`,
});

// Create interview
router.post(
  "/",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  interviewProxy,
);

// Get all recruiter's interviews
router.get(
  "/",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  interviewProxy,
);

// get the completed interview report for the recruiter 

router.get("/:interviewId/report", authenticate, authorize("RECRUITER", "ADMIN"), interviewProxy);

// Get interview
router.get(
  "/:id",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  interviewProxy,
);

// Update interview
router.put(
  "/:id",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  interviewProxy,
);

// Delete interview
router.delete(
  "/:id",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  interviewProxy,
);

// Publish interview
router.patch(
  "/:id/publish",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  interviewProxy,
);

export default router;