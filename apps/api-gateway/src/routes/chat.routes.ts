import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

const chatProxy = createProxyMiddleware({
  target: services.chat,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1${path}`,
});

// Conversations
router.post(
  "/conversations",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

router.get(
  "/conversations/:userId",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

router.get(
  "/conversations/:conversationId/messages",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

// Messages
router.post(
  "/messages",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

router.get(
  "/messages/:conversationId",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

router.patch(
  "/messages/:messageId",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

router.delete(
  "/messages/:messageId",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

// Attachments

router.post(
  "/attachments/upload",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  chatProxy,
);

export default router;