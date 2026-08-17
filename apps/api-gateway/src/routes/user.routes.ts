import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

const userProxy = createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1/users${path}`,
});

// Get logged-in user's own profile
router.get(
  "/me",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  userProxy,
);

// Update avatar
router.patch(
  "/me/avatar",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  userProxy,
);

// Update resume
router.patch(
  "/me/resume",
  authenticate,
  authorize("CANDIDATE"),
  userProxy,
);

// Public profile lookup
router.get("/:id", userProxy);

// Create profile
router.post(
  "/",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  userProxy,
);

// Update profile
router.patch(
  "/:id",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  userProxy,
);

// Delete profile
router.delete(
  "/delete-user/:id",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  userProxy,
);

export default router;