import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

const notificationProxy = createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1/notifications${path}`,
});

// Get logged-in user's notifications
router.get(
  "/",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  notificationProxy,
);

// Mark a notification as read
router.patch(
  "/:id/read",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  notificationProxy,
);

// Mark all notifications as read
router.patch(
  "/read-all",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  notificationProxy,
);

export default router;